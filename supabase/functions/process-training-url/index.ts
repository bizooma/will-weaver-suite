import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to extract content from meta tags and OpenGraph data
function extractMetaContent(html: string): string {
  const content: string[] = [];
  
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    content.push(titleMatch[1].trim());
  }
  
  // Extract meta description
  const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i) ||
                   html.match(/<meta[^>]*content="([^"]*)"[^>]*name="description"[^>]*>/i);
  if (descMatch && descMatch[1]) {
    content.push(descMatch[1].trim());
  }
  
  // Extract OpenGraph data
  const ogMatches = html.matchAll(/<meta[^>]*property="og:([^"]*)"[^>]*content="([^"]*)"[^>]*>/gi);
  for (const match of ogMatches) {
    if (match[1] && match[2] && (match[1] === 'description' || match[1] === 'title')) {
      content.push(match[2].trim());
    }
  }
  
  // Extract Twitter card data
  const twitterMatches = html.matchAll(/<meta[^>]*name="twitter:([^"]*)"[^>]*content="([^"]*)"[^>]*>/gi);
  for (const match of twitterMatches) {
    if (match[1] && match[2] && (match[1] === 'description' || match[1] === 'title')) {
      content.push(match[2].trim());
    }
  }
  
  return content.join(' ').replace(/\s+/g, ' ').trim();
}

// Improved HTML text extraction
function extractTextFromHTML(html: string): string {
  return html
    // Remove script and style tags with their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Remove comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // Replace common HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    // Remove all HTML tags
    .replace(/<[^>]*>/g, ' ')
    // Clean up whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract content from JSON-LD structured data
function extractJsonLdContent(html: string): string {
  const content: string[] = [];
  
  // Find all JSON-LD script tags
  const jsonLdMatches = html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
  
  for (const match of jsonLdMatches) {
    try {
      const jsonData = JSON.parse(match[1]);
      
      // Extract relevant text content from structured data
      const extractFromObject = (obj: any) => {
        if (typeof obj === 'string') {
          content.push(obj);
        } else if (typeof obj === 'object' && obj !== null) {
          // Extract common schema.org properties
          if (obj.name) content.push(obj.name);
          if (obj.description) content.push(obj.description);
          if (obj.headline) content.push(obj.headline);
          if (obj.text) content.push(obj.text);
          if (obj.about) content.push(obj.about);
          
          // Recursively process nested objects
          Object.values(obj).forEach(extractFromObject);
        }
      };
      
      extractFromObject(jsonData);
    } catch (e) {
      // Ignore invalid JSON
    }
  }
  
  return content.join(' ').replace(/\s+/g, ' ').trim();
}

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
      // Fetch the webpage content with better headers
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; TrainingBot/1.0; +https://example.com/bot)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 30000, // 30 second timeout
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
      }

      const html = await response.text();
      console.log(`HTML content length: ${html.length}`);
      
      // Enhanced content extraction with multiple strategies
      let textContent = '';
      let extractionMethod = 'unknown';
      
      // Strategy 1: Extract from meta tags and structured data
      const metaContent = extractMetaContent(html);
      if (metaContent.length > 50) {
        textContent = metaContent;
        extractionMethod = 'meta-tags';
        console.log(`Extracted ${textContent.length} characters using meta tags`);
      }
      
      // Strategy 2: Basic HTML text extraction (improved)
      if (!textContent) {
        textContent = extractTextFromHTML(html);
        extractionMethod = 'html-parsing';
        console.log(`Extracted ${textContent.length} characters using HTML parsing`);
      }
      
      // Strategy 3: Extract from JSON-LD structured data
      if (textContent.length < 50) {
        const jsonLdContent = extractJsonLdContent(html);
        if (jsonLdContent.length > textContent.length) {
          textContent = jsonLdContent;
          extractionMethod = 'json-ld';
          console.log(`Extracted ${textContent.length} characters using JSON-LD`);
        }
      }

      // Lower threshold and provide detailed logging
      if (!textContent || textContent.length < 30) {
        console.error(`Content extraction failed. Method: ${extractionMethod}, Length: ${textContent.length}`);
        console.error(`First 500 chars of HTML: ${html.substring(0, 500)}`);
        throw new Error(`Insufficient content extracted (${textContent.length} characters). The webpage might be JavaScript-heavy or have limited text content.`);
      }

      console.log(`Successfully extracted content using ${extractionMethod}: ${textContent.length} characters`);

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
              content_length: textContent.length,
              extraction_method: extractionMethod,
              processed_at: new Date().toISOString()
            }
          });
      }

      // Generate a more descriptive title
      const urlHostname = new URL(url).hostname;
      let title = `Website: ${urlHostname}`;
      
      // Try to use page title if available
      const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
      if (titleMatch && titleMatch[1] && titleMatch[1].trim()) {
        title = `${titleMatch[1].trim()} (${urlHostname})`;
      }

      // Update status to completed
      await supabase
        .from('training_sources')
        .update({ 
          status: 'completed',
          title: title
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