import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0';
import {
  corsHeaders,
  enforceBodySize,
  checkRateLimit,
  getClientIp,
  jsonResponse,
} from '../_shared/security.ts';

// PUBLIC endpoint — a widget on any embedding site posts here. We cannot
// require auth, so protection comes from:
//  1. 16 KB body cap (chat prompts are small)
//  2. Rate limit per IP + chatbotId (default 20 req/min); prevents a single
//     script from burning through OpenAI credit while still allowing normal
//     conversation pacing across multiple concurrent visitors.
//  3. Origin allowlist: if the chatbot row has `allowed_origins` (array of
//     hostnames), the request Origin must match one; empty/null = allow all
//     (backwards compatible with existing chatbots that were not configured).
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Enforce body size before parsing JSON
  const sizeErr = enforceBodySize(req, 16_000);
  if (sizeErr) return sizeErr;

  try {
    const { message, chatbotId, sessionId } = await req.json();

    if (typeof message !== 'string' || typeof chatbotId !== 'string') {
      return jsonResponse({ error: 'Invalid request body' }, 400);
    }
    // Cap the incoming message size as a defense in depth measure
    const userMessageText = message.slice(0, 4000);

    // Rate limit per IP + chatbot to slow single-source abuse
    const ip = getClientIp(req);
    const rl = checkRateLimit({
      key: `chatbot:${chatbotId}:${ip}`,
      limit: 20,
      windowSeconds: 60,
    });
    if (rl) return rl;

    console.log('Received request:', { chatbotId, ipHash: ip.slice(0, 6) });

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Optional origin allowlist stored in chatbots.configuration.allowedOrigins.
    // If set, reject requests whose Origin host isn't listed.
    const { data: chatbotMeta } = await supabase
      .from('chatbots')
      .select('configuration, is_active')
      .eq('id', chatbotId)
      .maybeSingle();

    if (chatbotMeta && chatbotMeta.is_active === false) {
      return jsonResponse({ error: 'Chatbot is disabled' }, 403);
    }
    const cfg = (chatbotMeta as { configuration?: Record<string, unknown> } | null)?.configuration;
    const rawList = cfg && Array.isArray((cfg as any).allowedOrigins) ? (cfg as any).allowedOrigins as unknown[] : [];
    if (rawList.length > 0) {
      const origin = req.headers.get('origin') || '';
      let host = '';
      try { host = new URL(origin).host.toLowerCase(); } catch { /* ignore */ }
      const ok = host && rawList.some((entry) => {
        const e = String(entry).trim().toLowerCase();
        if (!e) return false;
        if (e.startsWith('*.')) return host === e.slice(2) || host.endsWith(e.slice(1));
        return host === e;
      });
      if (!ok) {
        return jsonResponse({ error: 'Origin not allowed' }, 403);
      }
    }



    // Check if conversation has operator active
    if (sessionId) {
      const { data: conversation } = await supabase
        .from('chatbot_conversations')
        .select('operator_status, operator_user_id')
        .eq('session_id', sessionId)
        .eq('chatbot_id', chatbotId)
        .single();

      // If human operator is active, don't generate AI response
      if (conversation?.operator_status === 'human_active') {
        return new Response(
          JSON.stringify({
            response: "A human operator will assist you shortly.",
            hasTrainingData: false,
            operatorActive: true
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }
    }

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
        const baseTokens = userMessageText
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, ' ')
          .split(/\s+/)
          .filter(w => w.length > 2);

        const synonyms: Record<string, string[]> = {
          services: ['service', 'offerings', 'solutions', 'capabilities', 'what you do', 'practice areas', 'products'],
          pricing: ['price', 'cost', 'fee', 'fees', 'rates', 'plans'],
          price: ['pricing', 'cost', 'fee', 'fees', 'rates', 'plans'],
          cost: ['pricing', 'price', 'fee', 'fees', 'rates', 'plans'],
          fees: ['pricing', 'price', 'cost', 'fee', 'rates', 'plans'],
          fee: ['pricing', 'price', 'cost', 'fees', 'rates', 'plans'],
          rates: ['pricing', 'price', 'cost', 'fee', 'fees', 'plans'],
          plans: ['pricing', 'price', 'cost', 'fee', 'fees', 'rate'],
          contact: ['phone', 'email', 'reach', 'call', 'schedule', 'consultation'],
          about: ['company', 'firm', 'team', 'mission', 'who you are', 'overview'],
        };

        const expandedTokens = new Set<string>(baseTokens);
        for (const token of baseTokens) {
          const syns = synonyms[token as keyof typeof synonyms];
          if (syns) syns.forEach(s => expandedTokens.add(s));
        }

        const tokenList = Array.from(expandedTokens);

        const pricingTerms = new Set(['pricing','price','cost','fee','fees','rates','plans']);
        const queryIsPricing = baseTokens.some(t => pricingTerms.has(t));

        const scoredChunks = contentChunks.map((chunk) => {
          const content = chunk.content_chunk.toLowerCase();
          let score = 0;
          for (const t of tokenList) {
            if (!t) continue;
            // Count occurrences for stronger signals
            const occurrences = content.split(t).length - 1;
            if (occurrences > 0) {
              score += Math.min(occurrences, 3);
              // Extra weight for pricing-related terms
              if (pricingTerms.has(t)) {
                score += Math.min(occurrences, 3);
              }
            }
          }
          // If the user asked about pricing, boost chunks mentioning pricing keywords
          if (queryIsPricing) {
            let pricingHits = 0;
            pricingTerms.forEach(pt => { pricingHits += (content.split(pt).length - 1); });
            if (pricingHits > 0) {
              score += Math.min(pricingHits, 4);
            }
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
          { role: 'user', content: userMessageText }
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

    // Log the conversation message if sessionId is provided
    if (sessionId) {
      try {
        // Check if conversation exists
        const { data: existingConversation } = await supabase
          .from('chatbot_conversations')
          .select('conversation_data, message_count')
          .eq('session_id', sessionId)
          .eq('chatbot_id', chatbotId)
          .single();

        const currentTime = new Date().toISOString();
        const userMessage = { type: 'user', content: userMessageText, timestamp: currentTime };
        const botMessage = { type: 'bot', content: aiResponse, timestamp: currentTime };

        if (existingConversation) {
          // Update existing conversation
          const currentMessages = existingConversation.conversation_data?.messages || [];
          const updatedMessages = [...currentMessages, userMessage, botMessage];
          
          await supabase
            .from('chatbot_conversations')
            .update({
              conversation_data: { messages: updatedMessages },
              message_count: existingConversation.message_count + 2
            })
            .eq('session_id', sessionId)
            .eq('chatbot_id', chatbotId);
        } else {
          // Create new conversation
          await supabase
            .from('chatbot_conversations')
            .insert({
              chatbot_id: chatbotId,
              session_id: sessionId,
              conversation_data: { messages: [userMessage, botMessage] },
              message_count: 2
            });
        }
      } catch (logError) {
        console.error('Error logging conversation:', logError);
      }
    }

    return new Response(JSON.stringify({ 
      response: aiResponse,
      hasTrainingData: relevantContent.length > 0,
      operatorActive: false
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