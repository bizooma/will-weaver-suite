import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
// PDF text extraction library for Deno edge runtime
import pdf from 'npm:pdf-parse@1.1.1';

// CORS headers including all required Supabase client headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // === AuthN: require a valid Supabase JWT ===
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser(
      authHeader.replace('Bearer ', ''),
    );
    if (userErr || !userData?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userId = userData.user.id;

    const { trainingSourceId, filePath } = await req.json();

    if (!trainingSourceId || !filePath) {
      throw new Error('Missing trainingSourceId or filePath');
    }

    // Service-role client for the actual writes
    const supabase = createClient(supabaseUrl, supabaseKey);

    // === IDOR: verify the caller owns this training source ===
    const { data: source, error: sourceErr } = await supabase
      .from('training_sources')
      .select('id, user_id, chatbot_id')
      .eq('id', trainingSourceId)
      .maybeSingle();
    if (sourceErr || !source) {
      return new Response(JSON.stringify({ error: 'Training source not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    let owned = source.user_id === userId;
    if (!owned && source.chatbot_id) {
      const { data: bot } = await supabase
        .from('chatbots')
        .select('user_id')
        .eq('id', source.chatbot_id)
        .maybeSingle();
      owned = !!bot && bot.user_id === userId;
    }
    if (!owned) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processing document: ${filePath} for training source: ${trainingSourceId}`);

    // Update status to processing
    await supabase
      .from('training_sources')
      .update({ status: 'processing' })
      .eq('id', trainingSourceId);


    try {
      // Download the file from storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('training-documents')
        .download(filePath);

      if (downloadError) {
        throw new Error(`Failed to download file: ${downloadError.message}`);
      }

      // Convert file to text based on file type
      let textContent = '';
      const fileName = filePath.toLowerCase();

      if (fileName.endsWith('.txt')) {
        // Plain text file - read directly
        textContent = await fileData.text();
      } else if (fileName.endsWith('.pdf')) {
        // PDF file - extract text using pdf-parse
        console.log('Processing PDF file...');
        const arrayBuffer = await fileData.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);
        const pdfData = await pdf(buffer);
        textContent = pdfData.text || '';
        console.log(`Extracted ${textContent.length} characters from PDF (${pdfData.numpages} pages)`);
      } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
        // Word documents not yet supported
        throw new Error('Word document processing not yet supported. Please use .txt or .pdf files.');
      } else {
        throw new Error('Unsupported file format. Please use .txt or .pdf files.');
      }

      if (!textContent || textContent.trim().length < 50) {
        throw new Error('No substantial content found in the document');
      }

      // Clean up the text content
      textContent = textContent
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\n+/g, '\n')
        .replace(/\s+/g, ' ')
        .trim();

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
              file_path: filePath,
              file_type: fileName.split('.').pop(),
              total_chunks: chunks.length,
              content_length: textContent.length
            }
          });
      }

      // Update status to completed
      await supabase
        .from('training_sources')
        .update({ status: 'completed' })
        .eq('id', trainingSourceId);

      console.log(`Successfully processed document: ${filePath}, created ${chunks.length} content chunks`);

      return new Response(JSON.stringify({ 
        success: true, 
        chunksCreated: chunks.length,
        contentLength: textContent.length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (processingError) {
      console.error('Error processing document:', processingError);
      
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
    console.error('Error in process-training-document function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});