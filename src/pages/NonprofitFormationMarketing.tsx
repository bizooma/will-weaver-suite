import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const canonical = typeof window !== 'undefined' ? window.location.origin + "/nonprofit-formation-info" : "/nonprofit-formation-info";

const NonprofitFormationMarketing = () => {
  return (
    <main>
      <Helmet>
        <title>Nonprofit Formation & IRS 501(c)(3) Services | Amicus Edge</title>
        <meta name="description" content="Expert nonprofit formation services including IRS Form 1023 preparation, 501(c)(3) status application, and Google Ad Grants qualification assistance." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      
      <article className="container py-16 max-w-4xl">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl mb-6">Nonprofit Formation & 501(c)(3) Services</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Launch your nonprofit organization with confidence using our comprehensive <strong>Nonprofit Formation Platform</strong>. From IRS Form 1023 preparation to Google Ad Grants qualification, we guide you through every step of the process.
          </p>
        </header>

        <section className="mb-12">
          <p className="text-muted-foreground leading-relaxed mb-8">
            Our platform simplifies the complex process of nonprofit formation by providing:
          </p>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">IRS Form 1023 Preparation</h3>
              <p className="text-muted-foreground">Step-by-step guidance through the complete 501(c)(3) application process.</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Google Ad Grants Eligibility</h3>
              <p className="text-muted-foreground">Ensure your nonprofit qualifies for up to $10,000/month in free Google advertising.</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Legal Compliance Checks</h3>
              <p className="text-muted-foreground">Automated validation ensures all requirements are met before submission.</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Professional Review</h3>
              <p className="text-muted-foreground">Legal experts review your application to maximize approval chances.</p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Why Choose Our Nonprofit Formation Services</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Starting a nonprofit shouldn't be complicated. Our platform streamlines the entire process while ensuring full legal compliance:
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold">Expert Guidance</h3>
                <p className="text-muted-foreground">Navigate complex IRS requirements with confidence and clarity.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold">Time Savings</h3>
                <p className="text-muted-foreground">Reduce form preparation time from weeks to hours.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold">Higher Approval Rates</h3>
                <p className="text-muted-foreground">Professional review increases your chances of IRS approval.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Complete Nonprofit Formation Solution</h2>
          
          <div className="space-y-6">
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Organization Structure Setup</h3>
              <p className="text-muted-foreground">Define your mission, activities, governance structure, and operational framework.</p>
            </div>
            
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Financial Planning & Projections</h3>
              <p className="text-muted-foreground">Create realistic budgets and financial projections required by the IRS.</p>
            </div>
            
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Public Support Test Calculation</h3>
              <p className="text-muted-foreground">Determine the best classification for your nonprofit's funding structure.</p>
            </div>
            
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Google Ad Grants Preparation</h3>
              <p className="text-muted-foreground">Position your nonprofit to receive thousands in free advertising monthly.</p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Our Formation Process</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">1</div>
              <div>
                <h3 className="font-semibold mb-2">Organization Assessment</h3>
                <p className="text-muted-foreground">Comprehensive questionnaire to understand your mission, activities, and structure.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">2</div>
              <div>
                <h3 className="font-semibold mb-2">Form 1023 Preparation</h3>
                <p className="text-muted-foreground">Guided completion of all required sections with real-time validation.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">3</div>
              <div>
                <h3 className="font-semibold mb-2">Legal Review</h3>
                <p className="text-muted-foreground">Attorney review ensures accuracy and compliance before submission.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">4</div>
              <div>
                <h3 className="font-semibold mb-2">IRS Submission & Support</h3>
                <p className="text-muted-foreground">Professional submission and ongoing support throughout the approval process.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12 bg-accent/10 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Google Ad Grants Qualification</h2>
          <p className="text-muted-foreground mb-4">
            Did you know that qualifying nonprofits can receive up to <strong>$10,000 per month</strong> in free Google advertising? Our platform ensures your organization meets all Google Ad Grants requirements from day one.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold">Requirements We Help You Meet:</h4>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>• Valid 501(c)(3) status</li>
                <li>• Functional, high-quality website</li>
                <li>• Clear mission and activities</li>
                <li>• Compliance with Google policies</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">What You Get:</h4>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>• $10,000/month advertising budget</li>
                <li>• Google Ads platform access</li>
                <li>• Keyword targeting capabilities</li>
                <li>• Performance tracking tools</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="text-center">
          <p className="text-lg font-semibold mb-6">
            Start your nonprofit journey with expert guidance.
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

export default NonprofitFormationMarketing;