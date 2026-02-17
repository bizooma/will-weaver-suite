import SEOHead from "@/components/SEOHead";
import headshot from "@/assets/attorney-headshot.jpg";

const About = () => {
  return (
    <main>
      {/* Branded OG/Twitter meta tags for the About page */}
      <SEOHead
        title="About Amicus Edge | Legal Tech for Law Firms"
        description="Built by Legally Innovative, Amicus Edge delivers AI chatbots, SEO tools, and mobile apps designed specifically for law firms."
        path="/about"
      />
      
      <article className="container py-16 max-w-4xl">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl mb-6">About Us</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            At Amicus Edge, we believe law firms deserve the same high-level technology and client engagement tools that big brands enjoy — without the complexity or the inflated price tag.
          </p>
        </header>

        <section className="prose prose-lg max-w-none space-y-8">
          <div className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Developed by <strong><a href="https://bizooma.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Bizooma</a></strong>, a leader in law firm digital marketing and technology solutions, Amicus Edge was built to give firms a competitive advantage in an increasingly digital legal landscape.
            </p>
            
            {/* Bizooma Creative Agency logo with link */}
            <div className="flex items-center gap-4 my-6">
              <a 
                href="https://bizooma.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block hover:opacity-80 transition-opacity"
              >
                <img 
                  src="/lovable-uploads/bizooma-logo.png" 
                  alt="Bizooma Creative Agency Logo" 
                  className="h-16 w-auto"
                />
              </a>
            </div>
            
            <p className="text-muted-foreground leading-relaxed">
              Our mission is to bridge the gap between traditional legal marketing and the digital future, empowering legal professionals to deliver more efficient, accessible, and client-centered solutions.
            </p>
          </div>

          <section className="mt-12">
            <h2 className="text-3xl font-bold mb-6">What We Offer</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">Interactive Will & Trust Maker</h3>
                <p className="text-muted-foreground">Clients can complete their estate documents step-by-step or by speaking directly to the system. Fully brandable to your firm.</p>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">Alexa Skills for Law Firms</h3>
                <p className="text-muted-foreground">Extend your reach with voice-activated legal information, scheduling, and client engagement.</p>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">Custom Mobile Apps</h3>
                <p className="text-muted-foreground">Put your firm's resources and services directly into your clients' hands.</p>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">Customizable Video Chatbots</h3>
                <p className="text-muted-foreground">Greet visitors with a personalized video, answer questions, and capture leads 24/7.</p>
              </div>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-3xl font-bold mb-6">Why We Exist</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Technology is rapidly changing how clients find and interact with law firms. Many attorneys know they need to adapt — but don't have the time or resources to figure it out on their own. That's where we come in.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                With Amicus Edge, you get ready-made, fully customizable tools designed specifically for law firms. We handle the technology so you can focus on what you do best — practicing law and serving your clients.
              </p>
            </div>
          </section>
        </section>
      </article>
    </main>
  );
};

export default About;
