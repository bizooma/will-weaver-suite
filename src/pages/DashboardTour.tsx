import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { DemoModeProvider, useDemoMode } from "@/contexts/DemoModeContext";
import { TourWelcomeOverlay } from "@/components/TourWelcomeOverlay";
import { TourConversionDialog } from "@/components/TourConversionDialog";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTourTracking } from "@/hooks/useTourTracking";

/**
 * Dashboard Tour Page
 * Interactive tour of the platform with full functionality using demo data.
 * No authentication required - designed for visitor exploration and conversion.
 */

function DashboardTourContent() {
  const { enableDemoMode } = useDemoMode();
  const [showWelcome, setShowWelcome] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showConversion, setShowConversion] = useState(false);
  
  // Track tour engagement
  const { getTourEvents } = useTourTracking();

  useEffect(() => {
    // Enable demo mode when component mounts
    enableDemoMode();
    
    // Check if user has seen welcome before
    const hasSeenWelcome = sessionStorage.getItem('tour-welcome-seen');
    if (hasSeenWelcome) {
      setShowWelcome(false);
    }

    // Show demo mode toast on first interaction
    const handleFirstInteraction = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
        toast({
          title: "🎯 Tour Mode Active",
          description: "You're exploring with demo data - sign up to save your work",
          duration: 4000,
        });
      }
    };

    // Listen for any click to trigger first interaction toast
    document.addEventListener('click', handleFirstInteraction, { once: true });

    // Show conversion dialog after exploring 3+ features
    const checkEngagement = setInterval(() => {
      const events = getTourEvents();
      const uniqueFeatures = new Set(events.map(e => e.feature));
      
      if (uniqueFeatures.size >= 3 && !sessionStorage.getItem('conversion-shown')) {
        setShowConversion(true);
        sessionStorage.setItem('conversion-shown', 'true');
      }
    }, 30000); // Check every 30 seconds
    
    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      clearInterval(checkEngagement);
    };
  }, [enableDemoMode, hasInteracted, getTourEvents]);

  const handleCloseWelcome = () => {
    sessionStorage.setItem('tour-welcome-seen', 'true');
    setShowWelcome(false);
  };

  const handleCloseConversion = () => {
    setShowConversion(false);
  };

  const tourEvents = getTourEvents();
  const exploredFeatures = [...new Set(tourEvents.map(e => e.feature))].filter(Boolean);

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

      <TourWelcomeOverlay open={showWelcome} onClose={handleCloseWelcome} />
      <TourConversionDialog 
        open={showConversion} 
        onClose={handleCloseConversion}
        featuresExplored={exploredFeatures}
      />

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
