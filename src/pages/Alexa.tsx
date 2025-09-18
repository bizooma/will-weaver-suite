import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const canonical = typeof window !== 'undefined' ? window.location.origin + "/alexa" : "/alexa";

const Alexa = () => {
  return (
    <main>
      <Helmet>
        <title>Custom Alexa Skills for Law Firms | Amicus Edge</title>
        <meta name="description" content="Create custom-branded Alexa skills for your law firm. Allow clients to ask legal questions, schedule consultations, and access firm resources using voice commands." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      
      <article className="container py-16 max-w-4xl">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl mb-6">Bring Your Firm to Life on Amazon Alexa</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Your clients are already using voice assistants every day. With Amicus Edge, you can meet them where they are — on <strong>Amazon Alexa</strong> — and give them instant, hands-free access to your firm's services and expertise.
          </p>
        </header>

        <section className="mb-12">
          <p className="text-muted-foreground leading-relaxed mb-8">
            We create <strong>custom-branded Alexa skills</strong> for your law firm, allowing clients and prospects to:
          </p>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Ask Legal Questions</h3>
              <p className="text-muted-foreground">Provide helpful answers to common questions in your practice areas.</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Start a Will or Trust</h3>
              <p className="text-muted-foreground">Initiate your interactive document creator directly from their Alexa device.</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Schedule Consultations</h3>
              <p className="text-muted-foreground">Book an appointment with your firm using just their voice.</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Access Firm Resources</h3>
              <p className="text-muted-foreground">Share updates, guides, and important information on demand.</p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Why Your Firm Needs an Alexa Skill</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Voice search and AI-driven assistants are rapidly becoming the go-to for finding information. By putting your firm on Alexa, you:
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold">Expand Your Reach</h3>
                <p className="text-muted-foreground">Be present in clients' homes, offices, and even their cars.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold">Increase Engagement</h3>
                <p className="text-muted-foreground">Offer a modern, convenient way for clients to connect with you.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold">Build Trust Through Accessibility</h3>
                <p className="text-muted-foreground">Show you're forward-thinking and ready to serve anytime.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Your Brand, Your Skill</h2>
          <p className="text-muted-foreground leading-relaxed">
            Every Alexa skill we develop is fully customized with your firm's branding, messaging, and voice. From the welcome prompt to the final call-to-action, your skill sounds and feels like an extension of your practice.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">How It Works</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">1</div>
              <div>
                <h3 className="font-semibold mb-2">We Build Your Skill</h3>
                <p className="text-muted-foreground">Our team develops and configures the Alexa skill to your specifications.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">2</div>
              <div>
                <h3 className="font-semibold mb-2">We Brand It for You</h3>
                <p className="text-muted-foreground">Your colors, logo, and tone of voice are integrated into the experience.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">3</div>
              <div>
                <h3 className="font-semibold mb-2">We Launch It</h3>
                <p className="text-muted-foreground">Once live, clients can find your skill by searching Alexa or using your custom invocation phrase.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="text-center">
          <p className="text-lg font-semibold mb-6">
            Put your firm at the forefront of client convenience.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/contact" className="inline-flex items-center justify-center h-11 px-6 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              Contact Us Today
            </Link>
            <Link to="/dashboard" className="inline-flex items-center justify-center h-11 px-6 rounded-md border border-input hover:bg-accent hover:text-accent-foreground transition-colors">
              View Demo
            </Link>
          </div>
        </section>
      </article>
    </main>
  );
};

export default Alexa;
