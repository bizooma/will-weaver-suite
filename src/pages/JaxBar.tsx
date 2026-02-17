/**
 * JaxBar — Exclusive 50%-off pricing page for JAXbar.org attorneys.
 * This page is NOT indexed (noindex, nofollow) since it's a private sponsorship offer.
 * Mirrors the main PricingTable plans but displays halved prices.
 */

import React from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Crown, Scale } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Link } from "react-router-dom";

/**
 * JAX Bar exclusive plan definitions — 50% off standard pricing.
 * Each plan mirrors the main pricing but at the discounted rate.
 */
const jaxBarPlans = [
  {
    name: "Basic",
    originalPrice: "$1,500",
    price: "$750",
    description: "Essential tools for modern law firms",
    features: [
      "AIO SEO Analyzer",
      "Video Chatbots",
      "QR Code Generator",
      "Marketing Calendar",
      "Basic Analytics",
    ],
    icon: Check,
    popular: false,
  },
  {
    name: "Standard",
    originalPrice: "$2,500",
    price: "$1,250",
    description: "Enhanced tools with document creation",
    features: [
      "Everything in Basic",
      "Will & Trust Creator",
      "Advanced Analytics",
      "Priority Support",
    ],
    icon: Star,
    popular: false,
  },
  {
    name: "Pro PI",
    originalPrice: "$3,500",
    price: "$1,750",
    description: "Advanced tools with voice and mobile",
    features: [
      "Everything in Basic",
      "Alexa Skill",
      "Mobile App",
      "Voice Search Optimization",
      "Advanced Analytics",
    ],
    icon: Zap,
    popular: false,
  },
  {
    name: "Pro Estate",
    originalPrice: "$4,500",
    price: "$2,250",
    description: "Complete legal technology suite",
    features: [
      "Everything in Standard",
      "Alexa Skill",
      "Mobile App",
      "Voice Search Optimization",
      "Custom Integrations",
      "Dedicated Account Manager",
      "24/7 Phone Support",
    ],
    icon: Crown,
    popular: true,
  },
];

const JaxBar = () => {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState<string | null>(null);

  /** Redirect to contact page so JAX Bar members can claim the offer */
  const handleGetStarted = (planName: string) => {
    if (!user) {
      toast.info("Please sign in or contact us to claim your JAX Bar discount.");
    }
    // Navigate to contact page with plan info pre-filled
    window.location.href = `/contact?subject=JAX%20Bar%20Sponsorship%20-%20${encodeURIComponent(planName)}%20Plan`;
  };

  return (
    <main>
      {/* noindex/nofollow — this page should NOT be crawled or indexed */}
      <Helmet>
        <title>JAX Bar Exclusive Pricing | Amicus Edge</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="googlebot" content="noindex, nofollow" />
        <meta name="description" content="Exclusive 50% off Amicus Edge pricing for Jacksonville Bar Association members." />
      </Helmet>

      {/* Hero banner */}
      <section className="bg-primary/5 border-b">
        <div className="container py-16 text-center">
          <div className="flex justify-center mb-6">
            <Badge variant="secondary" className="text-sm px-4 py-1.5 gap-2">
              <Scale className="w-4 h-4" />
              Exclusive JAX Bar Member Pricing
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            50% Off for JAX Bar Members
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            As a proud sponsor of the{" "}
            <a
              href="https://jaxbar.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:no-underline"
            >
              Jacksonville Bar Association
            </a>
            , Amicus Edge is offering exclusive half-price access to our full suite of
            AI-powered marketing tools built specifically for law firms.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {jaxBarPlans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${plan.popular ? "border-primary shadow-lg scale-105" : ""}`}
            >
              {/* "Most Popular" badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1">
                    <Zap className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-2">
                  <plan.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>

                {/* Price display with strikethrough original price */}
                <div className="flex flex-col items-center">
                  <span className="text-lg text-muted-foreground line-through">
                    {plan.originalPrice}/mo
                  </span>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-primary">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">/month</span>
                  </div>
                </div>

                <CardDescription className="text-base">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                {/* Feature list */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <Check className="h-4 w-4 text-primary mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA button — routes to contact form with plan name */}
                <Button
                  className={`w-full ${plan.popular ? "bg-primary hover:bg-primary/90" : ""}`}
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleGetStarted(plan.name)}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer note */}
        <div className="text-center mt-12 space-y-2">
          <p className="text-sm text-muted-foreground">
            All plans include a 30-day money-back guarantee. Cancel anytime.
          </p>
          <p className="text-sm text-muted-foreground">
            Questions? Contact us at{" "}
            <a href="mailto:info@amicusedge.com" className="text-primary underline hover:no-underline">
              info@amicusedge.com
            </a>{" "}
            or call{" "}
            <a href="tel:+19045555555" className="text-primary underline hover:no-underline">
              (904) 555-5555
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  );
};

export default JaxBar;
