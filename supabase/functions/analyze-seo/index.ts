import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  url: string;
  userId?: string;
}

interface SEOAnalysis {
  seo: {
    score: number;
    title: { content: string; length: number; optimized: boolean; suggestions: string[] };
    metaDescription: { content: string; length: number; optimized: boolean; suggestions: string[] };
    headings: { h1Count: number; h2Count: number; structure: boolean; suggestions: string[] };
    images: { total: number; withAlt: number; missingAlt: string[]; suggestions: string[] };
    links: { internal: number; external: number; suggestions: string[] };
  };
  voiceSeo: {
    score: number;
    conversational: { detected: boolean; examples: string[]; suggestions: string[] };
    faq: { detected: boolean; count: number; suggestions: string[] };
    localSeo: { detected: boolean; elements: string[]; suggestions: string[] };
    longTail: { opportunities: string[]; suggestions: string[] };
  };
  aiOverview: {
    score: number;
    structuredData: { detected: boolean; types: string[]; suggestions: string[] };
    featuredSnippet: { potential: boolean; opportunities: string[]; suggestions: string[] };
    questionAnswer: { detected: boolean; count: number; suggestions: string[] };
    entities: { detected: string[]; suggestions: string[] };
  };
}

async function fetchPageContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEO-Analyzer/1.0)',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error('Error fetching page content:', error);
    throw new Error(`Failed to fetch page: ${error.message}`);
  }
}

function analyzePageContent(html: string, url: string): SEOAnalysis {
  // Basic HTML parsing using regex (for demo purposes)
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const metaDescMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i);
  const h1Matches = html.match(/<h1[^>]*>/gi) || [];
  const h2Matches = html.match(/<h2[^>]*>/gi) || [];
  const imgMatches = html.match(/<img[^>]*>/gi) || [];
  const linkMatches = html.match(/<a[^>]+href=["']([^"']*)/gi) || [];
  
  // Title analysis
  const title = titleMatch ? titleMatch[1].trim() : '';
  const titleLength = title.length;
  const titleOptimized = titleLength >= 30 && titleLength <= 60;
  
  // Meta description analysis
  const metaDesc = metaDescMatch ? metaDescMatch[1].trim() : '';
  const metaDescLength = metaDesc.length;
  const metaDescOptimized = metaDescLength >= 120 && metaDescLength <= 160;
  
  // Images with alt text
  const imagesWithAlt = imgMatches.filter(img => img.includes('alt=')).length;
  const missingAlt = imgMatches.length - imagesWithAlt;
  
  // Links analysis
  const domain = new URL(url).hostname;
  const internalLinks = linkMatches.filter(link => link.includes(domain)).length;
  const externalLinks = linkMatches.length - internalLinks;
  
  // Voice SEO analysis
  const conversationalWords = ['how', 'what', 'why', 'when', 'where', 'who', 'best', 'top'];
  const hasConversational = conversationalWords.some(word => 
    html.toLowerCase().includes(word)
  );
  
  // FAQ detection
  const faqIndicators = ['frequently asked questions', 'faq', 'q:', 'question:', 'answer:'];
  const hasFAQ = faqIndicators.some(indicator => 
    html.toLowerCase().includes(indicator.toLowerCase())
  );
  
  // Local SEO detection
  const localIndicators = ['address', 'phone', 'location', 'hours', 'directions'];
  const hasLocal = localIndicators.some(indicator => 
    html.toLowerCase().includes(indicator)
  );
  
  // Structured data detection
  const hasStructuredData = html.includes('application/ld+json') || 
                           html.includes('itemscope') || 
                           html.includes('schema.org');
  
  // Calculate scores
  const seoScore = Math.round(
    (titleOptimized ? 20 : 10) +
    (metaDescOptimized ? 20 : 10) +
    (h1Matches.length === 1 ? 20 : 10) +
    (imagesWithAlt / imgMatches.length * 20) +
    (internalLinks > 0 ? 20 : 10)
  );
  
  const voiceScore = Math.round(
    (hasConversational ? 25 : 0) +
    (hasFAQ ? 25 : 0) +
    (hasLocal ? 25 : 0) +
    25 // Base score for long-tail opportunities
  );
  
  const aiScore = Math.round(
    (hasStructuredData ? 30 : 0) +
    (hasFAQ ? 25 : 0) +
    (h1Matches.length > 0 ? 25 : 0) +
    20 // Base score for entity potential
  );
  
  return {
    seo: {
      score: seoScore,
      title: {
        content: title,
        length: titleLength,
        optimized: titleOptimized,
        suggestions: titleOptimized ? [] : ['Optimize title length to 30-60 characters']
      },
      metaDescription: {
        content: metaDesc,
        length: metaDescLength,
        optimized: metaDescOptimized,
        suggestions: metaDescOptimized ? [] : ['Add meta description between 120-160 characters']
      },
      headings: {
        h1Count: h1Matches.length,
        h2Count: h2Matches.length,
        structure: h1Matches.length === 1 && h2Matches.length > 0,
        suggestions: h1Matches.length !== 1 ? ['Use exactly one H1 tag per page'] : []
      },
      images: {
        total: imgMatches.length,
        withAlt: imagesWithAlt,
        missingAlt: [`${missingAlt} images missing alt text`],
        suggestions: missingAlt > 0 ? ['Add descriptive alt text to all images'] : []
      },
      links: {
        internal: internalLinks,
        external: externalLinks,
        suggestions: internalLinks === 0 ? ['Add internal links to improve site navigation'] : []
      }
    },
    voiceSeo: {
      score: voiceScore,
      conversational: {
        detected: hasConversational,
        examples: hasConversational ? ['Detected question words in content'] : [],
        suggestions: !hasConversational ? ['Add more conversational, question-based content'] : []
      },
      faq: {
        detected: hasFAQ,
        count: hasFAQ ? 1 : 0,
        suggestions: !hasFAQ ? ['Add FAQ section for voice search optimization'] : []
      },
      localSeo: {
        detected: hasLocal,
        elements: hasLocal ? ['Local business information detected'] : [],
        suggestions: !hasLocal ? ['Add location-specific information for local SEO'] : []
      },
      longTail: {
        opportunities: ['Focus on specific, detailed questions', 'Use natural language patterns'],
        suggestions: ['Target longer, more specific keyword phrases']
      }
    },
    aiOverview: {
      score: aiScore,
      structuredData: {
        detected: hasStructuredData,
        types: hasStructuredData ? ['Schema markup detected'] : [],
        suggestions: !hasStructuredData ? ['Implement structured data markup'] : []
      },
      featuredSnippet: {
        potential: hasFAQ || h1Matches.length > 0,
        opportunities: ['Clear question-answer format', 'Concise, informative content'],
        suggestions: ['Structure content for featured snippet optimization']
      },
      questionAnswer: {
        detected: hasFAQ,
        count: hasFAQ ? 1 : 0,
        suggestions: !hasFAQ ? ['Add clear question-answer sections'] : []
      },
      entities: {
        detected: ['Brand mentions', 'Topic-relevant entities'],
        suggestions: ['Strengthen entity relationships and authority signals']
      }
    }
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header for authenticated requests
    const authHeader = req.headers.get('Authorization');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: authHeader ? { Authorization: authHeader } : {}
        }
      }
    );

    const { url }: { url: string } = await req.json();
    
    // Get the current user from the auth token
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Auth error:', authError);
    }
    
    if (!url) {
      throw new Error('URL is required');
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      throw new Error('Invalid URL format');
    }

    console.log(`Starting SEO analysis for: ${url}`);

    // Fetch page content
    const html = await fetchPageContent(url);
    
    // Analyze the content
    const analysis = analyzePageContent(html, url);
    
    // Save analysis to database if user is authenticated
    let analysisId = null;
    let saved = false;
    if (user) {
      const { data, error } = await supabase
        .from('seo_analyses')
        .insert({
          user_id: user.id,
          url,
          analysis_data: analysis,
          seo_score: analysis.seo.score,
          voice_seo_score: analysis.voiceSeo.score,
          ai_overview_score: analysis.aiOverview.score,
          status: 'completed'
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving analysis:', error);
      } else {
        analysisId = data.id;
        saved = true;
        console.log(`Analysis saved with ID: ${analysisId}`);
      }
    } else {
      console.log('Anonymous analysis - not saved to database');
    }

    console.log(`Analysis completed for: ${url}`);

    return new Response(
      JSON.stringify({
        success: true,
        analysisId,
        saved,
        authenticated: !!user,
        url,
        analysis,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in analyze-seo function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});