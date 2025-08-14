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
        <title>Contact Amicus Edge | Legal Technology Solutions</title>
        <meta name="description" content="Contact Amicus Edge for custom legal technology solutions including Alexa skills, mobile apps, and chatbots for your law firm." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <section className="container py-16 grid gap-8 md:grid-cols-2">
        <div>
          <h1 className="text-4xl md:text-5xl mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground mb-8">Ready to transform your law firm with cutting-edge technology? Get in touch and let's discuss how Amicus Edge can help you serve your clients better.</p>
          <div className="space-y-4 text-muted-foreground">
            <div>
              <h3 className="font-semibold text-foreground mb-1">Phone</h3>
              <p className="text-lg">845-377-9730</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Address</h3>
              <p>2465 US-1S, Suite 1045</p>
              <p>St. Augustine, FL 32086</p>
            </div>
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