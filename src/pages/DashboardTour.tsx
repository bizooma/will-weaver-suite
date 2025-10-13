import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { DemoModeProvider, useDemoMode } from "@/contexts/DemoModeContext";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";

/**
 * Dashboard Tour Page
 * Interactive tour of the platform with full functionality using demo data.
 * No authentication required - designed for visitor exploration and conversion.
 */

function DashboardTourContent() {
  const { enableDemoMode } = useDemoMode();

  useEffect(() => {
    // Enable demo mode when component mounts
    enableDemoMode();
  }, [enableDemoMode]);

  return (
    <>
      <Helmet>
        <title>Interactive Platform Tour - Amicus Edge Legal Marketing Software</title>
        <meta 
          name="description" 
          content="Explore Amicus Edge's full legal marketing platform. Try our video chatbots, voice search optimization, QR codes, and more - no signup required." 
        />
        <meta 
          name="keywords" 
          content="legal marketing software demo, law firm technology tour, legal chatbot demo, voice search for lawyers" 
        />
      </Helmet>

      {/* Demo Mode Banner */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5" />
            <p className="text-sm font-medium">
              🎯 You're exploring our platform tour - all features are live with demo data
            </p>
          </div>
          <Button 
            asChild 
            variant="secondary" 
            size="sm"
            className="bg-white text-primary hover:bg-white/90"
          >
            <Link to="/auth">
              Sign Up to Keep Your Work
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <main className="flex-1">
            <DashboardContent />
          </main>
        </div>
      </SidebarProvider>
    </>
  );
}

const DashboardTour = () => {
  return (
    <DemoModeProvider>
      <DashboardTourContent />
    </DemoModeProvider>
  );
};

export default DashboardTour;
