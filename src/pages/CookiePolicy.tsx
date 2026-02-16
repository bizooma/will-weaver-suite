import SEOHead from "@/components/SEOHead";

const CookiePolicy = () => {
  return (
    <div className="container mx-auto max-w-4xl py-10">
      {/* SEO meta tags for Cookie Policy page */}
      <SEOHead
        title="Cookie Policy | Amicus Edge"
        description="Learn how Amicus Edge uses cookies and similar technologies to improve your law firm marketing experience."
        path="/cookie-policy"
        keywords={['cookie policy', 'data privacy', 'law firm platform cookies']}
      />
      
      <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
      <div className="prose prose-lg max-w-none">
        <p className="text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">What Are Cookies?</h2>
          <p className="mb-4">
            Cookies are small text files that are stored on your device when you visit our website. 
            They help us provide you with a better experience by remembering your preferences and 
            analyzing how you use our site.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Types of Cookies We Use</h2>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Necessary Cookies</h3>
            <p className="mb-2">These cookies are essential for the website to function properly:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Authentication cookies:</strong> Keep you logged in</li>
              <li><strong>Security cookies:</strong> Protect against fraud and abuse</li>
              <li><strong>Session cookies:</strong> Remember your current session</li>
            </ul>
            <p className="text-sm bg-blue-50 border border-blue-200 rounded p-3">
              <strong>Legal basis:</strong> Legitimate interest - these cookies are necessary for the website to function.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Analytics Cookies</h3>
            <p className="mb-2">These cookies help us understand how visitors use our website:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Usage statistics:</strong> Pages visited, time spent, bounce rate</li>
              <li><strong>Performance monitoring:</strong> Page load times, errors</li>
              <li><strong>User behavior:</strong> Click patterns, scroll depth</li>
            </ul>
            <p className="text-sm bg-green-50 border border-green-200 rounded p-3">
              <strong>Legal basis:</strong> Consent - you can opt out of these cookies at any time.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Marketing Cookies</h3>
            <p className="mb-2">These cookies are used for advertising and marketing purposes:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Targeted advertising:</strong> Show relevant ads based on interests</li>
              <li><strong>Campaign tracking:</strong> Measure ad effectiveness</li>
              <li><strong>Social media integration:</strong> Enable sharing and social features</li>
            </ul>
            <p className="text-sm bg-green-50 border border-green-200 rounded p-3">
              <strong>Legal basis:</strong> Consent - you can opt out of these cookies at any time.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Third-Party Cookies</h2>
          <p className="mb-4">We may use third-party services that set their own cookies:</p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Google Analytics:</strong> Website usage analytics</li>
            <li><strong>Supabase:</strong> Backend services and authentication</li>
            <li><strong>Content Delivery Networks:</strong> Faster content delivery</li>
          </ul>
          <p className="mb-4">
            These third parties have their own privacy policies and cookie practices, 
            which we encourage you to review.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Managing Your Cookie Preferences</h2>
          <p className="mb-4">You can control cookies in several ways:</p>
          
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Through Our Cookie Banner</h4>
            <p className="mb-2">
              When you first visit our site, you'll see a cookie consent banner where you can:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Accept all cookies</li>
              <li>Decline optional cookies</li>
              <li>Customize your preferences for each type</li>
            </ul>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold mb-2">Through Your Browser</h4>
            <p className="mb-2">Most browsers allow you to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>View and delete cookies</li>
              <li>Block cookies from specific websites</li>
              <li>Block all cookies (may affect website functionality)</li>
            </ul>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <p className="text-amber-800">
              <strong>Note:</strong> Disabling necessary cookies may affect the functionality of our website.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Cookie Retention</h2>
          <p className="mb-4">Different cookies have different lifespans:</p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Session cookies:</strong> Deleted when you close your browser</li>
            <li><strong>Persistent cookies:</strong> Remain for a set period (usually 1-2 years)</li>
            <li><strong>Consent cookies:</strong> Valid for 1 year from acceptance</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Updates to This Policy</h2>
          <p className="mb-4">
            We may update this Cookie Policy from time to time. When we do, we'll notify you by:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Updating the "Last updated" date at the top of this page</li>
            <li>Displaying a notification on our website</li>
            <li>Requesting renewed consent if required by law</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="mb-4">
            If you have any questions about our use of cookies, please contact us:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Email: privacy@example.com</li>
            <li>Visit our <a href="/contact" className="text-primary hover:underline">Contact page</a></li>
          </ul>
        </section>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">
            <strong>DEMO PLATFORM NOTICE:</strong> This is a demonstration platform only. 
            Cookie policies and data processing described here are for demonstration purposes. 
            In a production environment, ensure compliance with applicable privacy laws.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;