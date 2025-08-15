import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { contactFormSchema, type ContactFormInput } from "@/lib/validation";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const canonical = typeof window !== 'undefined' ? window.location.origin + "/contact" : "/contact";

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
      lawFirm: "",
      city: "",
      state: "",
    },
  });

  const onSubmit = async (data: ContactFormInput) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      console.log("Submitting contact form:", data);
      
      const { data: result, error } = await supabase.functions.invoke('submit-contact-form', {
        body: data,
      });

      if (error) {
        console.error("Function invocation error:", error);
        toast.error("Failed to send message. Please try again.");
        return;
      }

      if (result?.error) {
        console.error("Function returned error:", result.error);
        toast.error(result.error || "Failed to send message. Please try again.");
        return;
      }

      console.log("Contact form submitted successfully:", result);
      toast.success(result?.message || "Thank you for your message. We'll get back to you soon!");
      form.reset();
      
    } catch (error) {
      console.error("Contact form submission error:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
              <a href="tel:8453779730" className="text-lg hover:text-primary transition-colors">845-377-9730</a>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Address</h3>
              <p>2465 US-1S, Suite 1045</p>
              <p>St. Augustine, FL 32086</p>
            </div>
          </div>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-lg border p-6 bg-card grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lawFirm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Law Firm</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Message *</FormLabel>
                  <FormControl>
                    <Textarea rows={6} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="md:col-span-2">
              <Button 
                variant="hero" 
                type="submit" 
                disabled={isSubmitting}
                className="w-full md:w-auto"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </form>
        </Form>
      </section>
    </main>
  );
};

export default Contact;