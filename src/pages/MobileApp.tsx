import { Helmet } from "react-helmet-async";
import appMock from "@/assets/mobile-app-mock.jpg";

const canonical = typeof window !== 'undefined' ? window.location.origin + "/mobile-app" : "/mobile-app";

const MobileApp = () => {
  return (
    <main>
      <Helmet>
        <title>Mobile App | Legal Tech SaaS Demo</title>
        <meta name="description" content="Explore our iOS/Android app features for client intake, reminders, and document review." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <section className="container py-16 grid gap-8 md:grid-cols-2 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl mb-4">Mobile App</h1>
          <p className="text-lg text-muted-foreground">
            Client‑friendly app for secure intake, reminders, and document review. Built for speed and clarity.
          </p>
          <div className="mt-6 flex gap-3">
            <a className="h-11 px-6 inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground" href="#">Download iOS</a>
            <a className="h-11 px-6 inline-flex items-center justify-center rounded-md border border-input hover:bg-accent hover:text-accent-foreground transition-colors" href="#">Download Android</a>
          </div>
        </div>
        <div>
          <img src={appMock} alt="Mobile app mockup for legal tech" className="rounded-xl shadow" loading="lazy" />
        </div>
      </section>
    </main>
  );
};

export default MobileApp;
