import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Search, TrendingUp, Brain, CheckCircle } from "lucide-react";

const canonical = typeof window !== 'undefined' ? window.location.origin + "/aio-analyzer" : "/aio-analyzer";

const AIOAnalyzer = () => {
  return (
    <main>
      <Helmet>
        <title>AIO SEO Analyzer | Comprehensive Website Analysis Tool | Amicus Edge</title>
        <meta name="description" content="Analyze your website for SEO, Voice SEO, and AI Overview optimization. Get detailed insights and actionable recommendations to improve your search rankings." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      
      <article className="container py-16 max-w-4xl">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl mb-6">Complete Website Analysis for the AI Era</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            The digital landscape is evolving rapidly. With <strong>AI-powered search</strong>, voice assistants, and AI overviews changing how people find information, traditional SEO isn't enough anymore.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-4">
            Our <strong>AIO (AI-Optimized) Analyzer</strong> gives you a comprehensive analysis of your website across three critical dimensions: traditional SEO, Voice SEO, and AI Overview optimization.
          </p>
        </header>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Search className="h-8 w-8 text-primary" />
            What AIO Analyzer Does
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Get instant, actionable insights across three key areas that determine your visibility in the modern search landscape:
          </p>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="space-y-4 p-6 rounded-lg border bg-card">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-semibold">Traditional SEO</h3>
              </div>
              <p className="text-muted-foreground">Comprehensive analysis of title tags, meta descriptions, heading structure, image optimization, and internal linking.</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Title tag optimization</li>
                <li>• Meta description analysis</li>
                <li>• Heading structure review</li>
                <li>• Image alt text audit</li>
                <li>• Internal link analysis</li>
              </ul>
            </div>
            
            <div className="space-y-4 p-6 rounded-lg border bg-card">
              <div className="flex items-center gap-3">
                <Brain className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-semibold">Voice SEO</h3>
              </div>
              <p className="text-muted-foreground">Optimization for voice search queries, conversational content, and local SEO elements that voice assistants prioritize.</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Conversational content detection</li>
                <li>• FAQ section analysis</li>
                <li>• Local SEO elements</li>
                <li>• Long-tail keyword opportunities</li>
                <li>• Natural language patterns</li>
              </ul>
            </div>
            
            <div className="space-y-4 p-6 rounded-lg border bg-card">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-semibold">AI Overview</h3>
              </div>
              <p className="text-muted-foreground">Analysis for AI-powered search features, structured data, and content formatting that helps AI understand and feature your content.</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Structured data markup</li>
                <li>• Featured snippet potential</li>
                <li>• Question-answer formatting</li>
                <li>• Entity recognition</li>
                <li>• AI-friendly content structure</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Why Your Website Needs AIO Analysis</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Search is no longer just about keywords and backlinks. With AI-powered search engines, voice assistants, and AI overviews becoming mainstream, your optimization strategy needs to evolve.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">1</div>
              <div>
                <h3 className="font-semibold mb-2">Stay Ahead of Algorithm Changes</h3>
                <p className="text-muted-foreground">AI-powered search engines evaluate content differently. Our analyzer helps you optimize for both current and emerging ranking factors.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">2</div>
              <div>
                <h3 className="font-semibold mb-2">Capture Voice Search Traffic</h3>
                <p className="text-muted-foreground">Over 50% of adults use voice search daily. Optimize your content for the conversational queries people actually speak.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">3</div>
              <div>
                <h3 className="font-semibold mb-2">Get Featured in AI Overviews</h3>
                <p className="text-muted-foreground">Position your content to be selected and featured in AI-generated search results and overviews.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">4</div>
              <div>
                <h3 className="font-semibold mb-2">Comprehensive Baseline</h3>
                <p className="text-muted-foreground">Get detailed scores across all three dimensions to track your optimization progress over time.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Real Analysis, Real Results</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Our AIO Analyzer doesn't just give you scores—it provides detailed, actionable insights:
          </p>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Detailed Scoring</h3>
              <p className="text-muted-foreground">Get precise scores (0-100) for SEO, Voice SEO, and AI Overview optimization with clear explanations of what impacts your score.</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Specific Recommendations</h3>
              <p className="text-muted-foreground">Receive targeted suggestions for each area that needs improvement, prioritized by impact.</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Progress Tracking</h3>
              <p className="text-muted-foreground">Save your analysis results to track improvements over time and measure the impact of your optimizations.</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Instant Analysis</h3>
              <p className="text-muted-foreground">Get comprehensive results in seconds—no waiting for lengthy crawls or manual reviews.</p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Perfect for Law Firms</h2>
          <p className="text-muted-foreground leading-relaxed">
            Legal websites face unique challenges in the evolving search landscape. People increasingly use voice search for legal questions ("Alexa, what's the process for creating a will?") and expect immediate, authoritative answers from AI overviews.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-4">
            Our AIO Analyzer helps law firms optimize for these new search behaviors while maintaining strong traditional SEO fundamentals.
          </p>
        </section>

        <section className="text-center">
          <p className="text-lg font-semibold mb-6">
            Ready to optimize for the future of search?
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/dashboard/aio" className="inline-flex items-center justify-center h-11 px-6 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              Analyze Your Website
            </Link>
            <Link to="/contact" className="inline-flex items-center justify-center h-11 px-6 rounded-md border border-input hover:bg-accent hover:text-accent-foreground transition-colors">
              Contact Us
            </Link>
          </div>
        </section>

        <section className="mt-12 p-6 rounded-lg bg-muted">
          <h3 className="text-xl font-semibold mb-4">How It Works</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold mx-auto mb-2">1</div>
              <h4 className="font-medium mb-1">Enter Your URL</h4>
              <p className="text-sm text-muted-foreground">Simply provide the website URL you want to analyze</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold mx-auto mb-2">2</div>
              <h4 className="font-medium mb-1">AI Analysis</h4>
              <p className="text-sm text-muted-foreground">Our tool analyzes your site across all three optimization dimensions</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold mx-auto mb-2">3</div>
              <h4 className="font-medium mb-1">Get Results</h4>
              <p className="text-sm text-muted-foreground">Receive detailed scores and actionable recommendations</p>
            </div>
          </div>
        </section>
      </article>
    </main>
  );
};

export default AIOAnalyzer;