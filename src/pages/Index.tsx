import heroBg from "@/assets/hero-legal-tech-light.jpg";
import appMock from "@/assets/mobile-app-mock.jpg";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

import { generateMetaTags, generateStructuredData } from "@/lib/seo";

const canonical = typeof window !== 'undefined' ? window.location.origin + "/" : "/";

const Index = () => {
  const { user } = useAuth();

  const seoConfig = {
    title: 'Legal Tech SaaS Demo | AI-Powered Will Generator & Legal Tools',
    description: 'Experience our AI-powered legal document generation platform featuring will creator, Alexa skill, and mobile app integrations. Professional demo for law firms.',
    keywords: ['legal tech', 'will generator', 'legal AI', 'document automation', 'law firm software'],
    type: 'website' as const,
    url: '/',
  };

  const metaTags = generateMetaTags(seoConfig);
  const structuredData = generateStructuredData(seoConfig);

  return (
    <main>
      <Helmet>
        <title>{metaTags.title}</title>
        <meta name="description" content={metaTags.description} />
        <meta name="keywords" content={metaTags.keywords} />
        
        <meta property="og:title" content={metaTags['og:title']} />
        <meta property="og:description" content={metaTags['og:description']} />
        <meta property="og:image" content={metaTags['og:image']} />
        <meta property="og:url" content={metaTags['og:url']} />
        <meta property="og:type" content={metaTags['og:type']} />
        <meta property="og:site_name" content={metaTags['og:site_name']} />
        
        <meta name="twitter:card" content={metaTags['twitter:card']} />
        <meta name="twitter:title" content={metaTags['twitter:title']} />
        <meta name="twitter:description" content={metaTags['twitter:description']} />
        <meta name="twitter:image" content={metaTags['twitter:image']} />
        <meta name="twitter:site" content={metaTags['twitter:site']} />
        
        <link rel="canonical" href={metaTags.canonical} />
        
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={heroBg} alt="Light legal tech background with code and documents" className="h-full w-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/25 via-background/10 to-transparent" />
        </div>
        <div className="container pt-8 md:pt-12 pb-8 md:pb-12 grid gap-10 md:grid-cols-2 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl mb-4">Modern Legal Tools, Traditional Trust</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              A clean, conversion‑focused demo of our real‑time Will & Trust Creator, Alexa skill, and mobile app integrations.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {user ? (
                <a href="/will-creator"><Button variant="hero" size="lg">Create My Will</Button></a>
              ) : (
                <a href="/auth"><Button variant="hero" size="lg">Get Started</Button></a>
              )}
              <a href="/alexa"><Button variant="outline" size="lg">Try Alexa Demo</Button></a>
              <a href="/mobile-app"><Button variant="secondary" size="lg">Download Our App</Button></a>
            </div>
          </div>
          <div>
            <div className="relative aspect-[16/10] rounded-xl border bg-card shadow overflow-hidden animate-fade-in hover-scale">
              <iframe
                src="https://app.heygen.com/embeds/3a1e052ccc804697a2ea0a7fb12ef8ea"
                title="HeyGen video player"
                className="absolute inset-0 w-full h-full transition-all duration-300"
                allow="encrypted-media; fullscreen;"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      <section className="container py-16">
        <h2 className="text-3xl mb-8">Featured Tools</h2>
        <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/20 p-4">
          <div className="grid gap-6 md:grid-cols-4 lg:grid-cols-6">
            <article className="glass-card rounded-xl p-5">
              <h3 className="text-xl font-serifBrand mb-2">QR Code Generator</h3>
              <p className="text-sm text-muted-foreground mb-4">Create trackable QR codes for campaigns, events, and redirects with analytics.</p>
              <Button asChild variant="outline" size="sm">
                <Link to={user ? "/dashboard/qr-codes" : "/auth"}>Generate QR</Link>
              </Button>
            </article>
            <article className="glass-card rounded-xl p-5">
              <h3 className="text-xl font-serifBrand mb-2">AIO SEO Analyzer</h3>
              <p className="text-sm text-muted-foreground mb-4">Comprehensive website analysis for SEO, Voice SEO, and AI Overview optimization.</p>
              <Button asChild variant="outline" size="sm">
                <Link to="/aio-analyzer">Analyze Site</Link>
              </Button>
            </article>
            <article className="glass-card rounded-xl p-5">
              <h3 className="text-xl font-serifBrand mb-2">Video Chatbots</h3>
              <p className="text-sm text-muted-foreground mb-4">AI-powered video assistants for your website with customizable branding.</p>
              <Button asChild variant="outline" size="sm">
                <Link to={user ? "/dashboard/chatbots" : "/auth"}>Get Started</Link>
              </Button>
            </article>
            <article className="glass-card rounded-xl p-5">
              <h3 className="text-xl font-serifBrand mb-2">Will & Trust Creator</h3>
              <p className="text-sm text-muted-foreground mb-4">Step‑by‑step guided drafting with firm‑ready outputs. White‑label capable.</p>
              <Button asChild variant="outline" size="sm">
                <Link to="/will-creator">Explore</Link>
              </Button>
            </article>
            <article className="glass-card rounded-xl p-5">
              <h3 className="text-xl font-serifBrand mb-2">Alexa Skill</h3>
              <p className="text-sm text-muted-foreground mb-4">Voice‑first guidance for FAQs and client reminders.</p>
              <Button asChild variant="outline" size="sm">
                <Link to="/alexa">Try Demo</Link>
              </Button>
            </article>
            <article className="glass-card rounded-xl p-5">
              <h3 className="text-xl font-serifBrand mb-2">Mobile App</h3>
              <p className="text-sm text-muted-foreground mb-4">Native iOS and Android app with offline capabilities.</p>
              <Button asChild variant="outline" size="sm">
                <Link to="/mobile-app">Download</Link>
              </Button>
            </article>
          </div>
        </div>
      </section>

      <section className="container pb-20 grid gap-10 md:grid-cols-2 items-center">
        <div>
          <img src={appMock} alt="Mobile app mockup" className="rounded-xl shadow" loading="lazy" />
        </div>
        <div>
          <h2 className="text-3xl mb-3">Built for Performance</h2>
          <p className="text-muted-foreground mb-4">Fast, accessible, and SEO‑ready by design. Our stack delivers crisp UX and smooth interactions on any device.</p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            <li>Semantic HTML and structured data</li>
            <li>Mobile‑first, responsive layouts</li>
            <li>Easy embeds for chat/video widgets</li>
          </ul>
        </div>
      </section>

      <section className="container pb-24">
        <h2 className="text-3xl mb-6">Testimonials</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[1,2,3].map(i => (
            <blockquote key={i} className="rounded-lg border p-5 bg-card text-sm text-muted-foreground">
              “This platform made our intake and drafting so much faster.”
              <div className="mt-3 text-foreground font-medium">Attorney {i}</div>
            </blockquote>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Index;
