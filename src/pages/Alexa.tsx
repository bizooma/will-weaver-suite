import { Helmet } from "react-helmet-async";

const canonical = typeof window !== 'undefined' ? window.location.origin + "/alexa" : "/alexa";

const Alexa = () => {
  return (
    <main>
      <Helmet>
        <title>Alexa Skill Demo | Legal Tech SaaS</title>
        <meta name="description" content="Try our Alexa skill for estate planning prompts, reminders, and FAQs." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <section className="container py-16">
        <h1 className="text-4xl md:text-5xl mb-4">Alexa Skill</h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Voice‑first guidance for common estate planning questions and daily reminders.
        </p>
        <div className="mt-8 flex gap-3">
          <a href="#demo"><span className="sr-only">Skip to demo</span></a>
          <button className="h-11 px-6 rounded-md bg-primary text-primary-foreground">Try Demo</button>
          <a className="h-11 px-6 inline-flex items-center justify-center rounded-md border border-input hover:bg-accent hover:text-accent-foreground transition-colors" href="/contact">Partner with us</a>
        </div>
      </section>
    </main>
  );
};

export default Alexa;
