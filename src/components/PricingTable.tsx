// PricingTable: Displays subscription tiers with live Stripe checkout integration
// Shows the user's current plan and provides upgrade/manage buttons
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Crown, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { SUBSCRIPTION_TIERS } from "@/lib/subscriptionTiers";

interface PricingTableProps {
  title?: string;
  description?: string;
  onClose?: () => void;
}

// Plan definitions mapped to real Stripe price IDs
const plans = [
  {
    name: "Basic",
    price: "$1,500",
    description: "Essential tools for modern law firms",
    features: [
      "AIO SEO Analyzer",
      "Video Chatbots",
      "QR Code Generator",
      "Marketing Calendar",
      "Basic Analytics"
    ],
    icon: Check,
    popular: false,
    priceId: SUBSCRIPTION_TIERS.basic.price_id,
    tierName: SUBSCRIPTION_TIERS.basic.name,
  },
  {
    name: "Standard",
    price: "$2,500",
    description: "Enhanced tools with document creation",
    features: [
      "Everything in Basic",
      "Will & Trust Creator",
      "Advanced Analytics",
      "Priority Support"
    ],
    icon: Star,
    popular: false,
    priceId: SUBSCRIPTION_TIERS.standard.price_id,
    tierName: SUBSCRIPTION_TIERS.standard.name,
  },
  {
    name: "Pro PI",
    price: "$3,500",
    description: "Advanced tools with voice and mobile",
    features: [
      "Everything in Basic",
      "Alexa Skill",
      "Mobile App",
      "Voice Search Optimization",
      "Advanced Analytics"
    ],
    icon: Zap,
    popular: false,
    priceId: SUBSCRIPTION_TIERS.pro_pi.price_id,
    tierName: SUBSCRIPTION_TIERS.pro_pi.name,
  },
  {
    name: "Pro Estate",
    price: "$4,500",
    description: "Complete legal technology suite",
    features: [
      "Everything in Standard",
      "Alexa Skill",
      "Mobile App",
      "Voice Search Optimization",
      "Custom Integrations",
      "Dedicated Account Manager",
      "24/7 Phone Support"
    ],
    icon: Crown,
    popular: true,
    priceId: SUBSCRIPTION_TIERS.pro_estate.price_id,
    tierName: SUBSCRIPTION_TIERS.pro_estate.name,
  }
];

export function PricingTable({ title, description, onClose }: PricingTableProps) {
  const { user, subscriptionTier, subscriptionStatus } = useAuth();
  const [loading, setLoading] = React.useState<string | null>(null);

  // Initiate Stripe checkout for a given plan
  const handleUpgrade = async (priceId: string, planName: string) => {
    if (!user) {
      toast.error("Please sign in to upgrade your account");
      return;
    }

    try {
      setLoading(priceId);

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
        if (onClose) onClose();
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error("Failed to start checkout process. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  // Open the Stripe Customer Portal for subscription management
  const handleManageSubscription = async () => {
    try {
      setLoading("manage");

      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error("Failed to open subscription management. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  // Check if this plan is the user's current active plan
  const isCurrentPlan = (planName: string) => {
    return subscriptionStatus === 'active' && subscriptionTier === planName;
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-12 px-4">
      {/* Header section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          {title || "Upgrade Your Account"}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {description || "Choose the perfect plan for your legal practice and unlock powerful tools to grow your business."}
        </p>
        {/* Show manage subscription button if user has an active subscription */}
        {subscriptionStatus === 'active' && (
          <Button
            variant="outline"
            className="mt-4"
            onClick={handleManageSubscription}
            disabled={loading === "manage"}
          >
            <Settings className="w-4 h-4 mr-2" />
            {loading === "manage" ? "Opening..." : "Manage Subscription"}
          </Button>
        )}
      </div>

      {/* Pricing cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {plans.map((plan) => {
          const current = isCurrentPlan(plan.tierName);

          return (
            <Card
              key={plan.name}
              className={`relative ${plan.popular && !current ? 'border-primary shadow-lg scale-105' : ''} ${current ? 'border-primary shadow-lg ring-2 ring-primary' : ''}`}
            >
              {/* "Most Popular" badge */}
              {plan.popular && !current && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1">
                    <Zap className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              {/* "Your Plan" badge for the active subscription */}
              {current && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1">
                    <Check className="w-3 h-3 mr-1" />
                    Your Plan
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-2">
                  <plan.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">/month</span>
                </div>
                <CardDescription className="text-base">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="h-4 w-4 text-primary mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {current ? (
                  <Button className="w-full" variant="outline" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handleUpgrade(plan.priceId, plan.name)}
                    disabled={loading === plan.priceId}
                  >
                    {loading === plan.priceId ? "Processing..." : `Upgrade to ${plan.name}`}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="text-center mt-12">
        <p className="text-sm text-muted-foreground">
          All plans include a 30-day money-back guarantee. Cancel anytime.
        </p>
      </div>
    </div>
  );
}
