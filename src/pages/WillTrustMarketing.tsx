import SEOHead from "@/components/SEOHead";
import { Link } from "react-router-dom";

const WillTrustMarketing = () => {
  return (
    <main>
      {/* Branded OG/Twitter meta tags for the Will & Trust page */}
      <SEOHead
        title="Interactive Will & Trust Creator | Amicus Edge"
        description="Create legally compliant wills and trusts with our AI-powered platform. Secure, white-label estate planning tools built for law firms."
        path="/will-trust"
        keywords={['will creator', 'trust maker', 'estate planning software', 'law firm document automation']}
      />
      
      <article className="container py-16 max-w-4xl">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl mb-6">Interactive Will & Trust Creator</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Transform your estate planning practice with our cutting-edge <strong>Interactive Will & Trust Creator</strong>. Guide clients through the complex process of creating legally sound estate planning documents with confidence and ease.
          </p>
        </header>

        <section className="mb-12">
          <p className="text-muted-foreground leading-relaxed mb-8">
            Our comprehensive platform simplifies estate planning by offering:
          </p>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Step-by-Step Guidance</h3>
              <p className="text-muted-foreground">Intuitive questionnaires that walk clients through every decision point.</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Legal Compliance</h3>
              <p className="text-muted-foreground">All documents are generated to meet state-specific legal requirements.</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Secure Document Storage</h3>
              <p className="text-muted-foreground">Bank-level encryption protects sensitive client information.</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Professional Review</h3>
              <p className="text-muted-foreground">Built-in review workflows ensure attorney oversight.</p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Why Choose Our Digital Estate Planning Platform</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Estate planning doesn't have to be overwhelming. Our platform makes it accessible while maintaining the highest standards of legal accuracy:
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold">Streamlined Client Experience</h3>
                <p className="text-muted-foreground">Reduce appointment time while improving document accuracy.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold">Comprehensive Coverage</h3>
                <p className="text-muted-foreground">Wills, trusts, power of attorney, and healthcare directives.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold">Time & Cost Savings</h3>
                <p className="text-muted-foreground">Reduce document preparation time by up to 70%.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Features That Set Us Apart</h2>
          
          <div className="space-y-6">
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Smart Questionnaires</h3>
              <p className="text-muted-foreground">Dynamic forms that adapt based on client responses, ensuring no important details are missed.</p>
            </div>
            
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Real-Time Collaboration</h3>
              <p className="text-muted-foreground">Clients and attorneys can work together seamlessly with live document sharing and commenting.</p>
            </div>
            
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Automated Compliance Checks</h3>
              <p className="text-muted-foreground">Built-in validation ensures all documents meet jurisdictional requirements.</p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">How It Works</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">1</div>
              <div>
                <h3 className="font-semibold mb-2">Client Assessment</h3>
                <p className="text-muted-foreground">Comprehensive intake forms gather all necessary information about assets, beneficiaries, and wishes.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">2</div>
              <div>
                <h3 className="font-semibold mb-2">Document Generation</h3>
                <p className="text-muted-foreground">AI-powered engine creates tailored documents based on client responses and legal requirements.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">3</div>
              <div>
                <h3 className="font-semibold mb-2">Attorney Review</h3>
                <p className="text-muted-foreground">Legal professionals review and approve all documents before finalization.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">4</div>
              <div>
                <h3 className="font-semibold mb-2">Execution & Storage</h3>
                <p className="text-muted-foreground">Secure signing process and permanent document storage with easy access.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="text-center">
          <p className="text-lg font-semibold mb-6">
            Transform your estate planning practice today.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/contact" className="inline-flex items-center justify-center h-11 px-6 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              Contact Us Today
            </Link>
            <Link to="/auth" className="inline-flex items-center justify-center h-11 px-6 rounded-md border border-input hover:bg-accent hover:text-accent-foreground transition-colors">
              Get Started
            </Link>
          </div>
        </section>
      </article>
    </main>
  );
};

export default WillTrustMarketing;