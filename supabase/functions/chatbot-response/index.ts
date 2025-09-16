import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, chatbotId } = await req.json();
    
    console.log('Received request:', { message, chatbotId });

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get training content for this chatbot
    const { data: trainingSources, error: sourcesError } = await supabase
      .from('training_sources')
      .select('id')
      .eq('chatbot_id', chatbotId)
      .eq('status', 'completed');

    if (sourcesError) {
      console.error('Error fetching training sources:', sourcesError);
      throw sourcesError;
    }

    console.log('Found training sources:', trainingSources?.length || 0);

    let relevantContent = '';
    let usedFallback = false;
    
    if (trainingSources && trainingSources.length > 0) {
      const sourceIds = trainingSources.map(s => s.id);
      
      // Fetch more chunks to improve recall
      const { data: contentChunks, error: contentError } = await supabase
        .from('training_content')
        .select('content_chunk')
        .in('training_source_id', sourceIds)
        .limit(100);

      if (contentError) {
        console.error('Error fetching training content:', contentError);
      } else if (contentChunks && contentChunks.length > 0) {
        console.log('Fetched content chunks:', contentChunks.length);
        
        // Expanded keyword set with simple synonyms
        const baseTokens = message
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, ' ')
          .split(/\s+/)
          .filter(w => w.length > 2);

        const synonyms: Record<string, string[]> = {
          services: ['service', 'offerings', 'solutions', 'capabilities', 'what you do', 'practice areas', 'products'],
          pricing: ['price', 'cost', 'fee', 'fees', 'rates', 'plans'],
          contact: ['phone', 'email', 'reach', 'call', 'schedule', 'consultation'],
          about: ['company', 'firm', 'team', 'mission', 'who you are', 'overview'],
        };

        const expandedTokens = new Set<string>(baseTokens);
        for (const token of baseTokens) {
          const syns = synonyms[token as keyof typeof synonyms];
          if (syns) syns.forEach(s => expandedTokens.add(s));
        }

        const tokenList = Array.from(expandedTokens);

        const scoredChunks = contentChunks.map((chunk) => {
          const content = chunk.content_chunk.toLowerCase();
          let score = 0;
          for (const t of tokenList) {
            if (!t) continue;
            // Count occurrences for stronger signals
            const occurrences = content.split(t).length - 1;
            if (occurrences > 0) score += Math.min(occurrences, 3);
          }
          // Prefer longer, informative chunks slightly
          score += Math.min(Math.floor(chunk.content_chunk.length / 500), 2);
          return { content: chunk.content_chunk, score };
        });

        const positive = scoredChunks
          .filter(c => c.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 8);

        if (positive.length > 0) {
          relevantContent = positive.map(c => c.content).join('\n\n---\n\n');
          console.log('Selected relevant chunks:', { total: contentChunks.length, positive: positive.length });
        } else {
          // Fallback: include a few starter chunks so model can still summarize
          usedFallback = true;
          relevantContent = contentChunks.slice(0, 5).map(c => c.content_chunk).join('\n\n---\n\n');
          console.log('No positive matches; using fallback chunks', { total: contentChunks.length });
        }
      } else {
        console.log('No content chunks found for sources');
      }
    }

    // Prepare the prompt for OpenAI
    const systemPrompt = `You are a helpful assistant for a law firm website chatbot.

Use the provided Website Content to answer user questions. When the content doesn't directly answer, infer a concise, neutral summary of offerings or guidance based on what's available (titles, headings, descriptions) and clearly indicate it's a general overview. Never invent specifics (prices, guarantees, legal outcomes) not present in the content. Prefer bullet points for lists and keep answers under ~6 sentences unless the user asks for more.

Website Content:
${relevantContent || 'No specific content available for this query.'}

Answering rules:
- Be professional, concise, and accurate
- Use only facts from the Website Content; if unsure, say so
- If content is general, provide a short overview and suggest next steps
- Include relevant contact or scheduling prompts if in content (e.g., consultation)
`;


    // Call OpenAI API
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 450,
        temperature: 0.4,
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error('Failed to get AI response');
    }

    const openAIData = await openAIResponse.json();
    const aiResponse = openAIData.choices[0].message.content;

    console.log('Generated AI response');

    return new Response(JSON.stringify({ 
      response: aiResponse,
      hasTrainingData: relevantContent.length > 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chatbot-response function:', error);
    
    // Return a fallback response
    return new Response(JSON.stringify({ 
      response: "I apologize, but I'm having trouble processing your request right now. Please try again later or contact us directly for assistance.",
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});