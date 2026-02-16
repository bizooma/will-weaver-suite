import SEOHead from "@/components/SEOHead";

const posts = [
  { title: "Estate Planning Basics", slug: "estate-planning-basics", excerpt: "A primer on wills, trusts, and powers of attorney." },
  { title: "Elder Law Considerations", slug: "elder-law-considerations", excerpt: "Protecting loved ones through careful planning." },
  { title: "Choosing an Executor", slug: "choosing-an-executor", excerpt: "Key traits and responsibilities to keep in mind." },
]

const Blog = () => {
  return (
    <main>
      {/* Branded OG/Twitter meta tags for the Blog page */}
      <SEOHead
        title="Legal Marketing Resources | Amicus Edge Blog"
        description="Expert tips on law firm marketing, SEO, voice search, and AI-powered client engagement strategies."
        path="/blog"
        keywords={['law firm marketing', 'legal SEO blog', 'attorney marketing tips']}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: 'Amicus Edge Blog',
          url: typeof window !== 'undefined' ? window.location.origin + '/blog' : '/blog',
        }}
      />
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
