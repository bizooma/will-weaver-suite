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
    const { trainingSourceId, filePath } = await req.json();
    
    if (!trainingSourceId || !filePath) {
      throw new Error('Missing trainingSourceId or filePath');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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
        // Plain text file
        textContent = await fileData.text();
      } else if (fileName.endsWith('.pdf')) {
        // For PDF files, we'd need a PDF parsing library
        // For now, we'll return an error and suggest using text files
        throw new Error('PDF processing not yet implemented. Please use .txt files for now.');
      } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
        // For Word documents, we'd need a document parsing library
        throw new Error('Word document processing not yet implemented. Please use .txt files for now.');
      } else {
        throw new Error('Unsupported file format. Please use .txt files.');
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