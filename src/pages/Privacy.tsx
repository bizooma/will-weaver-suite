import SEOHead from "@/components/SEOHead";

const Privacy = () => {
  return (
    <div className="container mx-auto max-w-4xl py-10">
      {/* Branded OG/Twitter meta tags for the Privacy page */}
      <SEOHead
        title="Privacy Policy | Amicus Edge"
        description="Learn how Amicus Edge protects your data and handles personal information for law firm clients."
        path="/privacy"
      />
      
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <div className="prose prose-lg max-w-none">
        <p className="text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
          <p className="mb-4">We collect information you provide directly to us, such as:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Account information (email, display name)</li>
            <li>Will and legal document data you create</li>
            <li>Communication preferences</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
          <p className="mb-4">We use the information we collect to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide, maintain, and improve our services</li>
            <li>Create and manage your legal documents</li>
            <li>Communicate with you about our services</li>
            <li>Ensure platform security and prevent fraud</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
          <p className="mb-4">
            We implement appropriate technical and organizational measures to protect your personal data against 
            unauthorized access, alteration, disclosure, or destruction. Your documents are encrypted both in 
            transit and at rest.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Data Sharing</h2>
          <p className="mb-4">
            We do not sell, trade, or rent your personal information. We may share your information only in the 
            following circumstances:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>With your explicit consent</li>
            <li>To comply with legal obligations</li>
            <li>To protect our rights and prevent fraud</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
          <p className="mb-4">You have the right to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Delete your account and data</li>
            <li>Port your data to another service</li>
            <li>Object to data processing</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Legal Disclaimer</h2>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <p className="text-amber-800 font-medium">
              <strong>IMPORTANT:</strong> This platform is for demonstration purposes only. The legal documents 
              generated should NOT be used for actual legal purposes without review by a qualified attorney. 
              We are not a law firm and do not provide legal advice.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <p>Email: privacy@example.com</p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;