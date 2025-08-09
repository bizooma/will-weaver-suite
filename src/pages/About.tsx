import { Helmet } from "react-helmet-async";
import headshot from "@/assets/attorney-headshot.jpg";

const canonical = typeof window !== 'undefined' ? window.location.origin + "/about" : "/about";

const About = () => {
  return (
    <main>
      <Helmet>
        <title>About the Firm | Legal Tech SaaS Demo</title>
        <meta name="description" content="Mission, experience, and attorney bios for our legal tech demo firm." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <section className="container py-16">
        <h1 className="text-4xl md:text-5xl mb-4">About the Firm</h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          We blend traditional legal expertise with modern technology to deliver efficient, client‑first solutions.
        </p>
      </section>
      <section className="container grid gap-8 md:grid-cols-3 pb-20">
        {[1,2,3].map((i) => (
          <article key={i} className="space-y-3">
            <img src={headshot} alt={`Attorney headshot ${i}`} className="w-full h-64 object-cover rounded-lg" loading="lazy" />
            <h3 className="text-xl font-serifBrand">Attorney {i}</h3>
            <p className="text-sm text-muted-foreground">
              Seasoned counselor with experience in estate planning, trusts, and elder law.
            </p>
          </article>
        ))}
      </section>
    </main>
  );
};

export default About;
