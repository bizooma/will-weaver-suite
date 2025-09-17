import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface PricingTableProps {
  title?: string;
  description?: string;
  onClose?: () => void;
}

const plans = [
  {
    name: "Basic",
    price: "$1,500",
    description: "Perfect for solo practitioners",
    features: [
      "Video Chatbots",
      "Marketing Calendar", 
      "QR Code Generator",
      "Basic Analytics",
      "Email Support"
    ],
    icon: Check,
    popular: false,
    priceId: "price_basic_monthly" // You'll need to create this in Stripe
  },
  {
    name: "Professional", 
    price: "$3,500",
    description: "Ideal for growing law firms",
    features: [
      "Everything in Basic",
      "Voice Search Optimization",
      "Will Creator Tool", 
      "Alexa Skill Integration",
      "Advanced Analytics",
      "Priority Support",
      "White Label Options"
    ],
    icon: Star,
    popular: true,
    priceId: "price_professional_monthly" // You'll need to create this in Stripe
  },
  {
    name: "Enterprise",
    price: "$7,500", 
    description: "For large law firms and enterprises",
    features: [
      "Everything in Professional",
      "Custom Integrations",
      "Advanced User Management",
      "Custom Branding",
      "Dedicated Account Manager",
      "24/7 Phone Support",
      "Custom Training"
    ],
    icon: Crown,
    popular: false,
    priceId: "price_enterprise_monthly" // You'll need to create this in Stripe
  }
];

export function PricingTable({ title, description, onClose }: PricingTableProps) {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState<string | null>(null);

  const handleUpgrade = async (priceId: string, planName: string) => {
    if (!user) {
      toast.error("Please sign in to upgrade your account");
      return;
    }

    try {
      setLoading(priceId);
      
      // Call Stripe checkout function
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Open checkout in new tab
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

  return (
    <div className="w-full max-w-7xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          {title || "Upgrade Your Account"}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {description || "Choose the perfect plan for your legal practice and unlock powerful tools to grow your business."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan, index) => (
          <Card 
            key={plan.name} 
            className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
          >
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
                    <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                variant={plan.popular ? "default" : "outline"}
                onClick={() => handleUpgrade(plan.priceId, plan.name)}
                disabled={loading === plan.priceId}
              >
                {loading === plan.priceId ? "Processing..." : `Upgrade to ${plan.name}`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="text-center mt-12">
        <p className="text-sm text-muted-foreground">
          All plans include a 30-day money-back guarantee. Cancel anytime.
        </p>
      </div>
    </div>
  );
}