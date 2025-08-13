import { Helmet } from "react-helmet-async";

const Terms = () => {
  return (
    <div className="container mx-auto max-w-4xl py-10">
      <Helmet>
        <title>Terms of Service | Legal AI Assistant</title>
        <meta name="description" content="Read our terms of service and user agreement." />
      </Helmet>
      
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      <div className="prose prose-lg max-w-none">
        <p className="text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing and using this service, you accept and agree to be bound by the terms and provision 
            of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Service Description</h2>
          <p className="mb-4">
            This is a demonstration platform for legal document generation technology. The service allows users 
            to create draft legal documents using AI assistance.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Disclaimer of Legal Advice</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 font-medium">
              <strong>CRITICAL DISCLAIMER:</strong> This platform is for demonstration purposes only and does 
              NOT provide legal advice. Any documents generated should NOT be used for actual legal purposes 
              without review and approval by a qualified attorney. We are not a law firm and do not create 
              attorney-client relationships.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">User Responsibilities</h2>
          <p className="mb-4">Users agree to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide accurate information</li>
            <li>Use the service lawfully and ethically</li>
            <li>Not attempt to breach security measures</li>
            <li>Not use the service for actual legal matters</li>
            <li>Understand this is a demonstration only</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
          <p className="mb-4">
            In no event shall the service provider be liable for any indirect, incidental, special, consequential, 
            or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other 
            intangible losses, resulting from your use of the service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
          <p className="mb-4">
            We retain user data only as long as necessary to provide the service or as required by law. 
            Users may request deletion of their data at any time.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Modifications</h2>
          <p className="mb-4">
            We reserve the right to modify these terms at any time. Users will be notified of significant 
            changes via email or platform notification.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
          <p className="mb-4">
            Questions about these terms should be directed to: legal@example.com
          </p>
        </section>
      </div>
    </div>
  );
};

export default Terms;