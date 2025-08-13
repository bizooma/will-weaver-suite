import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { trainingSourceId, url } = await req.json();
    
    if (!trainingSourceId || !url) {
      throw new Error('Missing trainingSourceId or url');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Processing URL: ${url} for training source: ${trainingSourceId}`);

    // Update status to processing
    await supabase
      .from('training_sources')
      .update({ status: 'processing' })
      .eq('id', trainingSourceId);

    try {
      // Fetch the webpage content
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; TrainingBot/1.0)',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
      }

      const html = await response.text();
      
      // Basic text extraction (remove HTML tags)
      const textContent = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (!textContent || textContent.length < 100) {
        throw new Error('No substantial content found on the webpage');
      }

      // Split content into chunks (max 2000 characters each)
      const chunkSize = 2000;
      const chunks = [];
      for (let i = 0; i < textContent.length; i += chunkSize) {
        chunks.push(textContent.slice(i, i + chunkSize));
      }

      // Store chunks in training_content table
      for (let i = 0; i < chunks.length; i++) {
        await supabase
          .from('training_content')
          .insert({
            training_source_id: trainingSourceId,
            content_chunk: chunks[i],
            chunk_index: i,
            metadata: {
              source_url: url,
              total_chunks: chunks.length,
              content_length: textContent.length
            }
          });
      }

      // Update status to completed
      await supabase
        .from('training_sources')
        .update({ 
          status: 'completed',
          title: `Website: ${new URL(url).hostname}`
        })
        .eq('id', trainingSourceId);

      console.log(`Successfully processed URL: ${url}, created ${chunks.length} content chunks`);

      return new Response(JSON.stringify({ 
        success: true, 
        chunksCreated: chunks.length,
        contentLength: textContent.length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (processingError) {
      console.error('Error processing URL:', processingError);
      
      // Update status to failed
      await supabase
        .from('training_sources')
        .update({ 
          status: 'failed',
          error_message: processingError.message
        })
        .eq('id', trainingSourceId);

      throw processingError;
    }

  } catch (error) {
    console.error('Error in process-training-url function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});