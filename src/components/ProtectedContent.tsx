// ProtectedContent: Guards dashboard sections based on user role AND subscription tier.
// Supports both role-based gating (admin, user, free) and tier-based gating (basic, standard, pro_pi, pro_estate).
import React from "react";
import { useUserRole } from "@/hooks/useUserRole";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { useAuth } from "@/contexts/AuthContext";
import { PricingTable } from "./PricingTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { hasTierAccess, type TierKey } from "@/lib/subscriptionTiers";

interface ProtectedContentProps {
  children: React.ReactNode;
  /** Minimum role required (legacy gating) */
  requiredRole?: 'free' | 'user' | 'admin';
  /** Minimum subscription tier required — checked only when set */
  requiredTier?: TierKey;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

export function ProtectedContent({ 
  children, 
  requiredRole = 'user',
  requiredTier,
  fallbackTitle,
  fallbackDescription 
}: ProtectedContentProps) {
  const { hasAccess, loading, isFreeUser, isAdmin: isAdminUser } = useUserRole();
  const { isDemoMode } = useDemoMode();
  const { subscriptionStatus, subscriptionTier } = useAuth();

  // In demo mode, show all content unlocked
  if (isDemoMode) {
    return <>{children}</>;
  }

  // Admins bypass all role and tier gates
  if (!loading && isAdminUser) {
    return <>{children}</>;
  }

  if (loading || subscriptionStatus === 'loading') {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Role-based check first (admin gates, etc.)
  if (!hasAccess(requiredRole)) {
    // Free users see upgrade CTA
    if (isFreeUser && requiredRole !== 'free') {
      return (
        <div className="space-y-6">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                <div className="p-3 rounded-full bg-primary/10">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {fallbackTitle || "Premium Feature"}
              </CardTitle>
              <CardDescription className="text-base">
                {fallbackDescription || "Upgrade your account to unlock all powerful legal marketing features and save your work."}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild size="lg" className="gap-2">
                <Link to="/auth">
                  Sign Up to Unlock & Save
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          <PricingTable />
        </div>
      );
    }

    // Default role-restricted fallback
    return (
      <div className="flex items-center justify-center h-48">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>
              You don't have permission to access this feature.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Tier-based check — only enforced when requiredTier is set
  if (requiredTier && !hasTierAccess(subscriptionTier, requiredTier)) {
    return (
      <div className="space-y-6 p-6">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <div className="p-3 rounded-full bg-primary/10">
                <Lock className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">
              {fallbackTitle || "Upgrade Required"}
            </CardTitle>
            <CardDescription className="text-base">
              {fallbackDescription || "This feature requires a higher subscription tier. Upgrade your plan to unlock it."}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Your current plan: <strong>{subscriptionTier || "None"}</strong>
            </p>
          </CardContent>
        </Card>
        <PricingTable
          title="Upgrade to Unlock This Feature"
          description="Choose a plan that includes the tools your firm needs."
        />
      </div>
    );
  }

  return <>{children}</>;
}
