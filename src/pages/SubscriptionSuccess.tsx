// SubscriptionSuccess: Landing page after successful Stripe checkout
// Auto-refreshes subscription status so the user sees their new plan
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";

const SubscriptionSuccess = () => {
  const { refreshSubscription, subscriptionTier } = useAuth();
  const [refreshing, setRefreshing] = useState(true);

  // Auto-refresh subscription status on mount
  useEffect(() => {
    const refresh = async () => {
      await refreshSubscription();
      setRefreshing(false);
    };
    refresh();
  }, [refreshSubscription]);

  return (
    <>
      <SEOHead
        title="Subscription Confirmed | Amicus Edge"
        description="Your subscription to Amicus Edge has been confirmed. Access your law firm marketing tools now."
      />
      <main className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            {/* Green check circle */}
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">
              {refreshing ? "Confirming your subscription..." : "Welcome aboard!"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {refreshing ? (
              <p className="text-muted-foreground">
                We're verifying your subscription with Stripe. This will only take a moment.
              </p>
            ) : (
              <>
                <p className="text-muted-foreground">
                  Your <strong>{subscriptionTier || "subscription"}</strong> plan is now active.
                  You have full access to all included features for your law firm.
                </p>
                <div className="flex flex-col gap-2 pt-4">
                  <Button asChild>
                    <Link to="/dashboard">Go to Dashboard</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/">Back to Home</Link>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
};

export default SubscriptionSuccess;
