import SEOHead from "@/components/SEOHead";
import { Link } from "react-router-dom";
import appMock from "@/assets/mobile-app-mock.jpg";

const MobileApp = () => {
  return (
    <main>
      {/* Branded OG/Twitter meta tags for the Mobile App page */}
      <SEOHead
        title="Custom Mobile Apps for Law Firms | Amicus Edge"
        description="Get a branded mobile app for your law firm with document sharing, push notifications, scheduling, and legal resources on iOS & Android."
        path="/mobile-app"
        keywords={['law firm mobile app', 'legal app development', 'attorney mobile app']}
      />
      
      <article className="container py-16 max-w-4xl">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl mb-6">Put Your Firm in Your Clients' Pockets</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            In today's world, convenience wins. With a custom-branded mobile app from Amicus Edge, your law firm can stay connected with clients anytime, anywhere — right from their smartphones.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-4">
            We design and develop <strong>fully customized mobile apps</strong> that carry your firm's name, logo, and brand, giving you a powerful presence on both iOS and Android devices.
          </p>
        </header>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">What Your App Can Do</h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Your custom app can be tailored to include features like:
          </p>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Document Access & Sharing</h3>
              <p className="text-muted-foreground">Let clients view and upload important files securely.</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Interactive Will & Trust Maker</h3>
              <p className="text-muted-foreground">Give clients the ability to start or complete their estate planning right in the app.</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Push Notifications</h3>
              <p className="text-muted-foreground">Send timely updates, reminders, and announcements directly to their phone.</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Consultation Scheduling</h3>
              <p className="text-muted-foreground">Make it easy for clients to book appointments without calling your office.</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Legal Resources & Guides</h3>
              <p className="text-muted-foreground">Provide valuable content to keep clients informed and engaged.</p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Why Your Firm Needs a Mobile App</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold">24/7 Accessibility</h3>
                <p className="text-muted-foreground">Be available when and where your clients need you.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold">Increased Client Loyalty</h3>
                <p className="text-muted-foreground">Build stronger relationships with a direct, branded communication channel.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold">Competitive Edge</h3>
                <p className="text-muted-foreground">Show that your firm embraces technology to serve clients better.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Your Brand, Your App</h2>
          <p className="text-muted-foreground leading-relaxed">
            Every mobile app we build is 100% tailored to your firm. From the color scheme and icons to the features and navigation, your app will look and feel like an extension of your practice.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">How It Works</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">1</div>
              <div>
                <h3 className="font-semibold mb-2">We Learn Your Needs</h3>
                <p className="text-muted-foreground">We work with you to decide which features will benefit your clients most.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">2</div>
              <div>
                <h3 className="font-semibold mb-2">We Build & Brand</h3>
                <p className="text-muted-foreground">Our team designs your app with your logo, colors, and messaging.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">3</div>
              <div>
                <h3 className="font-semibold mb-2">We Launch It</h3>
                <p className="text-muted-foreground">Your app goes live in the App Store and Google Play, ready for clients to download.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="text-center">
          <p className="text-lg font-semibold mb-6">
            Your firm deserves to be just a tap away.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/contact" className="inline-flex items-center justify-center h-11 px-6 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              Contact Amicus Edge Today
            </Link>
            <Link to="/dashboard" className="inline-flex items-center justify-center h-11 px-6 rounded-md border border-input hover:bg-accent hover:text-accent-foreground transition-colors">
              View Demo
            </Link>
          </div>
        </section>

        <div className="mt-12 text-center">
          <img src={appMock} alt="Custom mobile app mockup for law firms" className="rounded-xl shadow mx-auto max-w-md" loading="lazy" />
        </div>
      </article>
    </main>
  );
};

export default MobileApp;
