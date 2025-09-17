import React from "react";
import { useUserRole } from "@/hooks/useUserRole";
import { PricingTable } from "./PricingTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Sparkles } from "lucide-react";

interface ProtectedContentProps {
  children: React.ReactNode;
  requiredRole?: 'free' | 'user' | 'admin';
  fallbackTitle?: string;
  fallbackDescription?: string;
}

export function ProtectedContent({ 
  children, 
  requiredRole = 'user',
  fallbackTitle,
  fallbackDescription 
}: ProtectedContentProps) {
  const { hasAccess, loading, isFreeUser } = useUserRole();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If user has access, show the content
  if (hasAccess(requiredRole)) {
    return <>{children}</>;
  }

  // If user is free and trying to access paid content, show pricing
  if (isFreeUser && requiredRole !== 'free') {
    return (
      <div className="space-y-6">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <div className="p-3 rounded-full bg-primary/10">
                <Lock className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {fallbackTitle || "Premium Feature"}
            </CardTitle>
            <CardDescription className="text-base">
              {fallbackDescription || "This feature is available to paid subscribers. Upgrade your account to access all our powerful legal tech tools."}
            </CardDescription>
          </CardHeader>
        </Card>
        
        <PricingTable />
      </div>
    );
  }

  // Default fallback for insufficient permissions
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