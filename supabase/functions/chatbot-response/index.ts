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
    
    if (trainingSources && trainingSources.length > 0) {
      const sourceIds = trainingSources.map(s => s.id);
      
      // Get training content chunks and search for relevant ones
      const { data: contentChunks, error: contentError } = await supabase
        .from('training_content')
        .select('content_chunk')
        .in('training_source_id', sourceIds)
        .limit(10); // Limit to avoid token limits

      if (contentError) {
        console.error('Error fetching training content:', contentError);
      } else if (contentChunks) {
        // Simple keyword-based relevance search
        const keywords = message.toLowerCase().split(' ').filter(w => w.length > 3);
        const scoredChunks = contentChunks.map(chunk => {
          const content = chunk.content_chunk.toLowerCase();
          const score = keywords.reduce((acc, keyword) => {
            return acc + (content.includes(keyword) ? 1 : 0);
          }, 0);
          return { ...chunk, score };
        });

        // Sort by relevance and take top chunks
        const topChunks = scoredChunks
          .filter(chunk => chunk.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);

        relevantContent = topChunks
          .map(chunk => chunk.content_chunk)
          .join('\n\n');
        
        console.log('Found relevant content chunks:', topChunks.length);
      }
    }

    // Prepare the prompt for OpenAI
    const systemPrompt = `You are a helpful assistant for a website chatbot. Use the following content from the website to answer questions accurately and helpfully. If the provided content doesn't contain relevant information to answer the question, politely say you don't have enough information about that specific topic and suggest they contact the company directly.

Website Content:
${relevantContent || 'No specific content available for this query.'}

Guidelines:
- Be helpful and professional
- Only use information from the provided website content
- If you don't have relevant information, be honest about it
- Keep responses concise but informative
- Suggest contacting the company for specific questions not covered in the content`;

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
        max_tokens: 300,
        temperature: 0.7,
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