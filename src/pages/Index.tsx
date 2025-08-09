import heroBg from "@/assets/hero-legal-tech-light.jpg";
import appMock from "@/assets/mobile-app-mock.jpg";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import HeroDemoFrame from "@/components/HeroDemoFrame";

const canonical = typeof window !== 'undefined' ? window.location.origin + "/" : "/";

const Index = () => {
  return (
    <main>
      <Helmet>
        <title>Legal Tech SaaS Demo | Will Generator, Alexa Skill, Mobile App</title>
        <meta name="description" content="Clean, professional demo site showcasing our will generator, Alexa skill, and mobile app for law firms." />
        <link rel="canonical" href={canonical} />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'LexiTech Demo',
            url: canonical,
            sameAs: []
          })}
        </script>
      </Helmet>

      <section className="relative overflow-hidden min-h-[70vh]">
        <div className="absolute inset-0 -z-10">
          <img src={heroBg} alt="Light legal tech background with code and documents" className="h-full w-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/20 to-transparent" />
        </div>
        <div className="container py-16 md:py-24 grid gap-10 md:grid-cols-2 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl mb-4">Modern Legal Tools, Traditional Trust</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              A clean, conversion‑focused demo of our real‑time Will & Trust Creator, Alexa skill, and mobile app integrations.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="/will-creator"><Button variant="hero" size="lg">Create My Will</Button></a>
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
