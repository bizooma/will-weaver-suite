import { Helmet } from "react-helmet-async";

const canonical = typeof window !== 'undefined' ? window.location.origin + "/blog" : "/blog";

const posts = [
  { title: "Estate Planning Basics", slug: "estate-planning-basics", excerpt: "A primer on wills, trusts, and powers of attorney." },
  { title: "Elder Law Considerations", slug: "elder-law-considerations", excerpt: "Protecting loved ones through careful planning." },
  { title: "Choosing an Executor", slug: "choosing-an-executor", excerpt: "Key traits and responsibilities to keep in mind." },
]

const Blog = () => {
  return (
    <main>
      <Helmet>
        <title>Blog & Resources | Legal Tech SaaS Demo</title>
        <meta name="description" content="SEO‑ready resources on estate planning, elder law, and trusts." />
        <link rel="canonical" href={canonical} />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: 'Legal Resources',
            url: canonical
          })}
        </script>
      </Helmet>
      <section className="container py-16">
        <h1 className="text-4xl md:text-5xl mb-6">Blog & Resources</h1>
        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((p) => (
            <article key={p.slug} className="rounded-lg border p-5 bg-card">
              <h3 className="text-xl font-serifBrand mb-1">{p.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{p.excerpt}</p>
              <a className="text-primary" href={`#${p.slug}`}>Read more</a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Blog;
