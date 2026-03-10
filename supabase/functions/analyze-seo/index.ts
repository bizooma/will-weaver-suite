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

interface PageMetrics {
  loadTime: number;
  wordCount: number;
  contentDensity: number;
  readabilityScore: number;
}

interface TechnicalSEO {
  ssl: boolean;
  mobileFriendly: boolean;
  
  canonicalTag: boolean;
  
  sitemap: boolean;
}

interface ContentAnalysis {
  keywordDensity: { [key: string]: number };
  semanticKeywords: string[];
  topicRelevance: number;
  contentFreshness: boolean;
  duplicateContent: boolean;
}

interface CompetitiveAnalysis {
  authorityScore: number;
  backlinksEstimate: number;
  domainAge: number;
  socialSignals: number;
}

interface SEOAnalysis {
  seo: {
    score: number;
    title: { content: string; length: number; optimized: boolean; suggestions: string[]; keywords: string[] };
    metaDescription: { content: string; length: number; optimized: boolean; suggestions: string[]; hasCall2Action: boolean };
    headings: { h1Count: number; h2Count: number; h3Count: number; structure: boolean; suggestions: string[]; hierarchy: boolean };
    images: { total: number; withAlt: number; missingAlt: string[]; suggestions: string[]; optimizedFormats: number };
    links: { internal: number; external: number; broken: number; suggestions: string[]; anchor: string[] };
    technical: TechnicalSEO;
    content: ContentAnalysis;
    performance: PageMetrics;
  };
  voiceSeo: {
    score: number;
    conversational: { detected: boolean; examples: string[]; suggestions: string[]; questionCount: number };
    faq: { detected: boolean; count: number; suggestions: string[]; structuredFormat: boolean };
    localSeo: { detected: boolean; elements: string[]; suggestions: string[]; nabPresence: boolean };
    longTail: { opportunities: string[]; suggestions: string[]; naturalLanguage: boolean };
    featured: { snippetPotential: boolean; listFormat: boolean; directAnswers: number };
  };
  aiOverview: {
    score: number;
    structuredData: { detected: boolean; types: string[]; suggestions: string[]; coverage: number };
    featuredSnippet: { potential: boolean; opportunities: string[]; suggestions: string[]; formats: string[] };
    questionAnswer: { detected: boolean; count: number; suggestions: string[]; clarity: number };
    entities: { detected: string[]; suggestions: string[]; authority: number; topical: string[] };
    expertise: { authorCredentials: boolean; citations: number; freshness: boolean; depth: number };
  };
  competitive: CompetitiveAnalysis;
  recommendations: {
    priority: string[];
    quick_wins: string[];
    long_term: string[];
    technical: string[];
  };
}

async function fetchPageContent(url: string): Promise<{ html: string; metrics: PageMetrics }> {
  try {
    const startTime = Date.now();
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 AIOAnalyzer/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    const loadTime = Date.now() - startTime;
    
    // Calculate content metrics
    const textContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const wordCount = textContent.split(' ').filter(word => word.length > 0).length;
    const contentDensity = wordCount / html.length;
    
    // Simple readability score (Flesch Reading Ease approximation)
    const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const avgWordsPerSentence = wordCount / Math.max(sentences, 1);
    const avgSyllablesPerWord = 1.5; // Approximation
    const readabilityScore = Math.max(0, Math.min(100, 
      206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)
    ));
    
    return {
      html,
      metrics: {
        loadTime,
        wordCount,
        contentDensity: Math.round(contentDensity * 10000) / 100,
        readabilityScore: Math.round(readabilityScore)
      }
    };
  } catch (error) {
    console.error('Error fetching page content:', error);
    throw new Error(`Failed to fetch page: ${error.message}`);
  }
}

function extractKeywords(text: string): { [key: string]: number } {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !isStopWord(word));
  
  const freq: { [key: string]: number } = {};
  const totalWords = words.length;
  
  words.forEach(word => {
    freq[word] = (freq[word] || 0) + 1;
  });
  
  // Convert to density percentages
  Object.keys(freq).forEach(word => {
    freq[word] = Math.round((freq[word] / totalWords) * 10000) / 100;
  });
  
  return freq;
}

function isStopWord(word: string): boolean {
  const stopWords = [
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'use', 'way', 'she', 'many', 'oil', 'sit', 'word', 'from', 'have', 'they', 'that', 'with', 'this', 'will', 'been', 'each', 'make', 'water', 'like', 'time', 'very', 'when', 'come', 'into', 'over', 'also', 'back', 'after', 'first', 'well', 'work', 'here', 'other', 'such', 'what', 'take', 'than', 'only', 'think', 'say', 'where', 'much', 'before'
  ];
  return stopWords.includes(word);
}

function analyzeTechnicalSEO(html: string, url: string): TechnicalSEO {
  return {
    ssl: url.startsWith('https://'),
    mobileFriendly: html.includes('viewport') || html.includes('mobile'),
    
    canonicalTag: html.includes('rel="canonical"'),
    robotsTxt: true, // Placeholder - would need robots.txt check
    sitemap: html.includes('sitemap') || false
  };
}

function analyzeContentQuality(html: string): ContentAnalysis {
  const textContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const keywords = extractKeywords(textContent);
  
  // Get top keywords
  const sortedKeywords = Object.entries(keywords)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
  
  return {
    keywordDensity: keywords,
    semanticKeywords: sortedKeywords,
    topicRelevance: Math.min(100, Math.max(0, sortedKeywords.length * 10)),
    contentFreshness: html.includes(new Date().getFullYear().toString()),
    duplicateContent: false // Placeholder - would need external API
  };
}

function analyzePageContent(html: string, url: string, metrics: PageMetrics): SEOAnalysis {
  // Enhanced HTML parsing with better regex patterns
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const metaDescMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i);
  const metaKeywordsMatch = html.match(/<meta[^>]+name=["']keywords["'][^>]+content=["']([^"']*)/i);
  const h1Matches = html.match(/<h1[^>]*>([^<]*)<\/h1>/gi) || [];
  const h2Matches = html.match(/<h2[^>]*>([^<]*)<\/h2>/gi) || [];
  const h3Matches = html.match(/<h3[^>]*>([^<]*)<\/h3>/gi) || [];
  const imgMatches = html.match(/<img[^>]*>/gi) || [];
  const linkMatches = html.match(/<a[^>]+href=["']([^"']*)[^>]*>([^<]*)<\/a>/gi) || [];
  
  // Advanced content analysis
  const textContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const contentAnalysis = analyzeContentQuality(html);
  const technicalSEO = analyzeTechnicalSEO(html, url);
  
  // Title analysis with keyword extraction
  const title = titleMatch ? titleMatch[1].trim() : '';
  const titleLength = title.length;
  const titleOptimized = titleLength >= 30 && titleLength <= 60;
  const titleKeywords = title ? extractKeywords(title) : {};
  
  // Enhanced meta description analysis
  const metaDesc = metaDescMatch ? metaDescMatch[1].trim() : '';
  const metaDescLength = metaDesc.length;
  const metaDescOptimized = metaDescLength >= 120 && metaDescLength <= 160;
  const hasCallToAction = /\b(call|contact|get|buy|order|learn|discover|find|visit|try|start|book|schedule)\b/i.test(metaDesc);
  
  // Advanced image analysis
  const imagesWithAlt = imgMatches.filter(img => img.includes('alt=')).length;
  const optimizedFormats = imgMatches.filter(img => 
    img.includes('.webp') || img.includes('.avif') || img.includes('format=webp')
  ).length;
  const missingAlt = imgMatches.length - imagesWithAlt;
  
  // Enhanced link analysis
  const domain = new URL(url).hostname;
  const allLinks = linkMatches.map(link => {
    const hrefMatch = link.match(/href=["']([^"']*)/);
    return hrefMatch ? hrefMatch[1] : '';
  });
  
  const internalLinks = allLinks.filter(link => 
    link.includes(domain) || link.startsWith('/') || !link.includes('http')
  ).length;
  const externalLinks = allLinks.filter(link => 
    link.includes('http') && !link.includes(domain)
  ).length;
  
  // Extract anchor text patterns
  const anchorTexts = linkMatches.map(link => {
    const textMatch = link.match(/>([^<]*)<\/a>/);
    return textMatch ? textMatch[1].trim() : '';
  }).filter(text => text.length > 0);
  
  // Voice SEO analysis with enhanced detection
  const questionWords = ['how', 'what', 'why', 'when', 'where', 'who', 'which', 'can', 'should', 'will', 'best', 'top', 'near me'];
  const questionCount = questionWords.reduce((count, word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = textContent.match(regex);
    return count + (matches ? matches.length : 0);
  }, 0);
  
  const hasConversational = questionCount > 0;
  const conversationalExamples = questionWords.filter(word => 
    textContent.toLowerCase().includes(word)
  ).slice(0, 5);
  
  // Enhanced FAQ detection
  const faqIndicators = [
    'frequently asked questions', 'faq', 'q:', 'question:', 'answer:', 
    'common questions', 'questions and answers', 'q&a'
  ];
  const faqCount = faqIndicators.reduce((count, indicator) => {
    const regex = new RegExp(indicator, 'gi');
    const matches = html.match(regex);
    return count + (matches ? matches.length : 0);
  }, 0);
  const hasFAQ = faqCount > 0;
  const structuredFAQ = html.includes('itemtype="https://schema.org/FAQPage"') || 
                      html.includes('"@type": "FAQPage"');
  
  // Enhanced local SEO detection
  const localElements = [];
  if (html.includes('address') || html.includes('location')) localElements.push('Address/Location');
  if (html.includes('phone') || html.includes('tel:')) localElements.push('Phone Number');
  if (html.includes('hours') || html.includes('open')) localElements.push('Business Hours');
  if (html.includes('map') || html.includes('directions')) localElements.push('Map/Directions');
  if (html.includes('reviews') || html.includes('rating')) localElements.push('Reviews/Ratings');
  
  const nabPresence = html.includes('name') && html.includes('address') && html.includes('phone');
  
  // Enhanced structured data detection
  const structuredDataTypes = [];
  if (html.includes('application/ld+json')) {
    structuredDataTypes.push('JSON-LD');
    // Try to extract schema types
    const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([^<]*)<\/script>/gi);
    if (jsonLdMatches) {
      jsonLdMatches.forEach(match => {
        if (match.includes('"@type"')) {
          const typeMatch = match.match(/"@type":\s*"([^"]+)"/);
          if (typeMatch) structuredDataTypes.push(typeMatch[1]);
        }
      });
    }
  }
  if (html.includes('itemscope')) structuredDataTypes.push('Microdata');
  if (html.includes('property="og:')) structuredDataTypes.push('Open Graph');
  if (html.includes('name="twitter:')) structuredDataTypes.push('Twitter Cards');
  
  const hasStructuredData = structuredDataTypes.length > 0;
  const structuredDataCoverage = Math.min(100, structuredDataTypes.length * 25);
  
  // Featured snippet analysis
  const listFormats = html.includes('<ol>') || html.includes('<ul>');
  const tableFormats = html.includes('<table>');
  const definitiveAnswers = textContent.match(/\b(is|are|means|refers to|defined as)\b/gi)?.length || 0;
  
  // Authority and expertise analysis
  const authorCredentials = html.includes('author') || html.includes('written by') || html.includes('bio');
  const citations = (html.match(/href=["'][^"']*\.edu[^"']*["']/gi) || []).length +
                   (html.match(/href=["'][^"']*\.gov[^"']*["']/gi) || []).length +
                   (html.match(/href=["'][^"']*\.org[^"']*["']/gi) || []).length;
  
  const contentDepth = Math.min(100, Math.max(0, (metrics.wordCount - 300) / 20));
  
  // Entity detection (simplified)
  const entityPatterns = ['LLC', 'Inc', 'Corp', 'Ltd', 'Company', 'Law Firm', 'Attorney', 'Lawyer'];
  const detectedEntities = entityPatterns.filter(pattern => 
    html.includes(pattern)
  );
  
  // Calculate comprehensive scores
  const seoBaseScore = 
    (titleOptimized ? 15 : 5) +
    (metaDescOptimized ? 15 : 5) +
    (h1Matches.length === 1 ? 15 : 5) +
    (h2Matches.length > 0 ? 10 : 0) +
    (imagesWithAlt > 0 ? Math.min(15, (imagesWithAlt / imgMatches.length) * 15) : 0) +
    (internalLinks > 0 ? 10 : 0) +
    (technicalSEO.ssl ? 5 : 0) +
    (technicalSEO.canonicalTag ? 5 : 0) +
    (contentAnalysis.topicRelevance > 50 ? 10 : 5);
  
  const voiceBaseScore = 
    (hasConversational ? 25 : 0) +
    (hasFAQ ? 20 : 0) +
    (structuredFAQ ? 10 : 0) +
    (localElements.length > 0 ? Math.min(20, localElements.length * 5) : 0) +
    (listFormats ? 10 : 0) +
    (questionCount > 5 ? 15 : questionCount * 3);
  
  const aiBaseScore = 
    (hasStructuredData ? 25 : 0) +
    (structuredDataCoverage > 50 ? 15 : structuredDataCoverage * 0.3) +
    (definitiveAnswers > 0 ? Math.min(15, definitiveAnswers * 3) : 0) +
    (authorCredentials ? 10 : 0) +
    (citations > 0 ? Math.min(15, citations * 5) : 0) +
    (contentDepth > 50 ? 20 : contentDepth * 0.4);
  
  // Competitive analysis (simplified)
  const competitive: CompetitiveAnalysis = {
    authorityScore: Math.min(100, (citations * 10) + (detectedEntities.length * 5) + (internalLinks * 2)),
    backlinksEstimate: Math.max(10, Math.min(1000, internalLinks * 50)), // Rough estimate
    domainAge: 5, // Placeholder - would need WHOIS lookup
    socialSignals: html.includes('share') || html.includes('social') ? 25 : 5
  };
  
  // Generate recommendations
  const recommendations = generateRecommendations({
    titleOptimized, metaDescOptimized, hasStructuredData, hasFAQ, 
    missingAlt, internalLinks, technicalSEO, contentAnalysis, hasConversational
  });
  
  return {
    seo: {
      score: Math.min(100, Math.round(seoBaseScore)),
      title: {
        content: title,
        length: titleLength,
        optimized: titleOptimized,
        keywords: Object.keys(titleKeywords).slice(0, 5),
        suggestions: titleOptimized ? 
          (titleKeywords && Object.keys(titleKeywords).length === 0 ? ['Consider adding relevant keywords to title'] : []) :
          ['Optimize title length to 30-60 characters', 'Include target keywords naturally']
      },
      metaDescription: {
        content: metaDesc,
        length: metaDescLength,
        optimized: metaDescOptimized,
        hasCall2Action: hasCallToAction,
        suggestions: metaDescOptimized ? 
          (!hasCallToAction ? ['Add call-to-action in meta description'] : []) :
          ['Add meta description between 120-160 characters', 'Include compelling call-to-action']
      },
      headings: {
        h1Count: h1Matches.length,
        h2Count: h2Matches.length,
        h3Count: h3Matches.length,
        structure: h1Matches.length === 1 && h2Matches.length > 0,
        hierarchy: h1Matches.length === 1 && h2Matches.length > 0 && h3Matches.length >= h2Matches.length,
        suggestions: h1Matches.length !== 1 ? 
          ['Use exactly one H1 tag per page'] : 
          (h2Matches.length === 0 ? ['Add H2 subheadings for better content structure'] : [])
      },
      images: {
        total: imgMatches.length,
        withAlt: imagesWithAlt,
        missingAlt: missingAlt > 0 ? [`${missingAlt} images missing alt text`] : [],
        optimizedFormats: optimizedFormats,
        suggestions: [
          ...(missingAlt > 0 ? ['Add descriptive alt text to all images'] : []),
          ...(optimizedFormats < imgMatches.length ? ['Consider using WebP or AVIF formats for better performance'] : [])
        ]
      },
      links: {
        internal: internalLinks,
        external: externalLinks,
        broken: 0, // Placeholder - would need link checking
        anchor: anchorTexts.slice(0, 5),
        suggestions: [
          ...(internalLinks < 3 ? ['Add more internal links to improve site navigation'] : []),
          ...(anchorTexts.filter(text => text === 'click here' || text === 'read more').length > 0 ? 
              ['Use descriptive anchor text instead of generic phrases'] : [])
        ]
      },
      technical: technicalSEO,
      content: contentAnalysis,
      performance: metrics
    },
    voiceSeo: {
      score: Math.min(100, Math.round(voiceBaseScore)),
      conversational: {
        detected: hasConversational,
        questionCount: questionCount,
        examples: conversationalExamples,
        suggestions: !hasConversational ? 
          ['Add more conversational, question-based content', 'Target "how to" and "what is" queries'] : 
          (questionCount < 5 ? ['Increase conversational content with more question-based headings'] : [])
      },
      faq: {
        detected: hasFAQ,
        count: faqCount,
        structuredFormat: structuredFAQ,
        suggestions: !hasFAQ ? 
          ['Add FAQ section for voice search optimization'] : 
          (!structuredFAQ ? ['Implement FAQ schema markup for better AI understanding'] : [])
      },
      localSeo: {
        detected: localElements.length > 0,
        elements: localElements,
        nabPresence: nabPresence,
        suggestions: localElements.length === 0 ? 
          ['Add location-specific information for local SEO'] : 
          (!nabPresence ? ['Ensure Name, Address, Phone (NAP) consistency'] : [])
      },
      longTail: {
        opportunities: [
          'Target specific location + service combinations',
          'Focus on "near me" search queries',
          'Create content around detailed process questions'
        ],
        naturalLanguage: questionCount > 3,
        suggestions: ['Target longer, more specific keyword phrases that match natural speech patterns']
      },
      featured: {
        snippetPotential: listFormats || definitiveAnswers > 0,
        listFormat: listFormats,
        directAnswers: definitiveAnswers,
      }
    },
    aiOverview: {
      score: Math.min(100, Math.round(aiBaseScore)),
      structuredData: {
        detected: hasStructuredData,
        types: structuredDataTypes,
        coverage: structuredDataCoverage,
        suggestions: !hasStructuredData ? 
          ['Implement structured data markup (JSON-LD recommended)'] :
          (structuredDataCoverage < 75 ? ['Expand structured data coverage with additional schema types'] : [])
      },
      featuredSnippet: {
        potential: listFormats || definitiveAnswers > 0,
        opportunities: [
          ...(listFormats ? [] : ['Create numbered or bulleted lists for step-by-step processes']),
          ...(definitiveAnswers < 3 ? ['Add clear, definitive answers to common questions'] : []),
          ...(tableFormats ? [] : ['Use tables for comparison data'])
        ],
        formats: [
          ...(listFormats ? ['Lists'] : []),
          ...(tableFormats ? ['Tables'] : []),
          ...(definitiveAnswers > 0 ? ['Definitions'] : [])
        ],
        suggestions: ['Structure content for featured snippet optimization with clear, concise answers']
      },
      questionAnswer: {
        detected: hasFAQ,
        count: faqCount,
        clarity: Math.min(100, definitiveAnswers * 10),
        suggestions: !hasFAQ ? 
          ['Add clear question-answer sections'] : 
          (definitiveAnswers < 3 ? ['Provide more direct, clear answers to questions'] : [])
      },
      entities: {
        detected: detectedEntities,
        authority: competitive.authorityScore,
        topical: contentAnalysis.semanticKeywords.slice(0, 5),
        suggestions: [
          'Strengthen entity relationships and authority signals',
          ...(citations < 3 ? ['Add citations to authoritative sources'] : []),
          ...(detectedEntities.length < 2 ? ['Clearly establish business entity and expertise'] : [])
        ]
      },
      expertise: {
        authorCredentials: authorCredentials,
        citations: citations,
        freshness: contentAnalysis.contentFreshness,
        depth: contentDepth
      }
    },
    competitive: competitive,
    recommendations: recommendations
  };
}

function generateRecommendations(analysis: any) {
  const priority = [];
  const quickWins = [];
  const longTerm = [];
  const technical = [];
  
  // Priority fixes
  if (!analysis.titleOptimized) priority.push('Optimize page title length and keyword placement');
  if (!analysis.metaDescOptimized) priority.push('Write compelling meta description with call-to-action');
  if (!analysis.hasStructuredData) priority.push('Implement structured data markup');
  
  // Quick wins
  if (analysis.missingAlt > 0) quickWins.push('Add alt text to all images');
  if (analysis.internalLinks < 3) quickWins.push('Add internal linking between related pages');
  if (!analysis.hasFAQ) quickWins.push('Create FAQ section targeting voice search');
  if (!analysis.technicalSEO.ssl) quickWins.push('Enable HTTPS/SSL certificate');
  
  // Long-term improvements
  if (analysis.contentAnalysis.topicRelevance < 70) longTerm.push('Expand content depth and topical authority');
  if (!analysis.hasConversational) longTerm.push('Develop conversational content strategy');
  longTerm.push('Build high-quality backlinks from relevant sources');
  longTerm.push('Optimize for local search and Google My Business');
  
  // Technical improvements
  if (!analysis.technicalSEO.canonicalTag) technical.push('Add canonical tags to prevent duplicate content');
  if (!analysis.technicalSEO.mobileFriendly) technical.push('Improve mobile responsiveness');
  
  technical.push('Implement comprehensive internal linking strategy');
  
  return { priority, quick_wins: quickWins, long_term: longTerm, technical };
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

    // Fetch page content with performance metrics
    const { html, metrics } = await fetchPageContent(url);
    
    // Analyze the content with enhanced algorithms
    const analysis = analyzePageContent(html, url, metrics);
    
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