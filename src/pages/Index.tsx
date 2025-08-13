import heroBg from "@/assets/hero-legal-tech-light.jpg";
import appMock from "@/assets/mobile-app-mock.jpg";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import HeroDemoFrame from "@/components/HeroDemoFrame";
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
        <div className="container pt-12 md:pt-20 grid gap-10 md:grid-cols-2 items-center">
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
            <HeroDemoFrame />
          </div>
        </div>
      </section>

      <section className="container py-16">
        <h2 className="text-3xl mb-8">Featured Tools</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <article className="rounded-lg border p-5 bg-card">
            <h3 className="text-xl font-serifBrand mb-2">Will & Trust Creator</h3>
            <p className="text-sm text-muted-foreground mb-4">Step‑by‑step guided drafting with firm‑ready outputs. White‑label capable.</p>
            <a className="text-primary" href="/will-creator">Explore</a>
          </article>
          <article className="rounded-lg border p-5 bg-card">
            <h3 className="text-xl font-serifBrand mb-2">Alexa Skill</h3>
            <p className="text-sm text-muted-foreground mb-4">Voice‑first guidance for FAQs and client reminders.</p>
            <a className="text-primary" href="/alexa">Try Demo</a>
          </article>
          <article className="rounded-lg border p-5 bg-card">
            <h3 className="text-xl font-serifBrand mb-2">Mobile App</h3>
            <p className="text-sm text-muted-foreground mb-4">Secure client intake, reminders, and document review.</p>
            <a className="text-primary" href="/mobile-app">See Features</a>
          </article>
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
