import { Helmet } from "react-helmet-async";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const canonical = typeof window !== 'undefined' ? window.location.origin + "/contact" : "/contact";

const Contact = () => {
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent (demo)");
  };

  return (
    <main>
      <Helmet>
        <title>Contact | Legal Tech SaaS Demo</title>
        <meta name="description" content="Get in touch for demos, partnerships, or support." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <section className="container py-16 grid gap-8 md:grid-cols-2">
        <div>
          <h1 className="text-4xl md:text-5xl mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground">We’d love to hear from you. Fill out the form and we’ll respond shortly.</p>
          <div className="mt-6 text-sm text-muted-foreground">
            <p>(555) 123-4567</p>
            <p>hello@example.com</p>
            <p>123 Main St, Suite 400, Your City</p>
          </div>
        </div>
        <form onSubmit={onSubmit} className="rounded-lg border p-6 bg-card grid gap-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" rows={6} required />
          </div>
          <div>
            <Button variant="hero" type="submit">Send Message</Button>
          </div>
        </form>
      </section>
    </main>
  );
};

export default Contact;
