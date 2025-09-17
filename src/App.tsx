
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useSecurityMonitoring, useSuspiciousActivityDetection } from "@/hooks/useSecurity";
import { useAnalytics, useErrorTracking, usePerformanceMonitoring, useAccessibilityMonitoring } from "@/hooks/useMonitoring";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import WillCreator from "./pages/WillCreator";
import Alexa from "./pages/Alexa";
import AIOAnalyzer from "./pages/AIOAnalyzer";
import MobileApp from "./pages/MobileApp";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import CreateAdmin from "./pages/CreateAdmin";
import Auth from "./pages/Auth";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import CookiePolicy from "./pages/CookiePolicy";
import DataPrivacy from "./pages/DataPrivacy";
import Dashboard from "./pages/Dashboard";
import ProductionDashboard from "./pages/ProductionDashboard";
import CookieConsentBanner from "./components/CookieConsentBanner";
import SiteHeader from "./components/layout/SiteHeader";
import SiteFooter from "./components/layout/SiteFooter";
import ChatbotWidget from "./components/ChatbotWidget";
import VoiceAgentBar from "./components/VoiceAgentBar";

import DraftSave from "./pages/DraftSave";
import DraftView from "./pages/DraftView";
import QRCodes from "./pages/QRCodes";
import VideoChatbots from "./pages/VideoChatbots";
import VoiceSearchSimulator from "./pages/VoiceSearchSimulator";

const queryClient = new QueryClient();

const AppContent = () => {
  const isEmbed = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('embed') === '1';
  
  // Security monitoring
  useSecurityMonitoring();
  useSuspiciousActivityDetection();
  
  // Production monitoring
  useAnalytics();
  useErrorTracking();
  usePerformanceMonitoring();
  useAccessibilityMonitoring();

  return (
    <BrowserRouter>
      {!isEmbed && <SiteHeader />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard/*" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/will-creator" element={
          <ProtectedRoute>
            <WillCreator />
          </ProtectedRoute>
        } />
        <Route path="/alexa" element={<Alexa />} />
        <Route path="/aio-analyzer" element={<AIOAnalyzer />} />
        <Route path="/mobile-app" element={<MobileApp />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/create-admin" element={<CreateAdmin />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/cookies" element={<CookiePolicy />} />
        <Route path="/data-privacy" element={
          <ProtectedRoute>
            <DataPrivacy />
          </ProtectedRoute>
        } />
        <Route path="/production-dashboard" element={
          <ProtectedRoute>
            <ProductionDashboard />
          </ProtectedRoute>
        } />
        <Route path="/drafts/save" element={
          <ProtectedRoute>
            <DraftSave />
          </ProtectedRoute>
        } />
        <Route path="/drafts/:slug" element={<DraftView />} />
        <Route path="/qr-codes" element={<QRCodes />} />
        <Route path="/video-chatbots" element={<VideoChatbots />} />
        <Route path="/voice-search-simulator" element={<VoiceSearchSimulator />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isEmbed && <SiteFooter />}
      {!isEmbed && <VoiceAgentBar agentId="bQYvVXsrFk4WxoQMcYno" />}
      {!isEmbed && <ChatbotWidget />}
      
      {!isEmbed && <CookieConsentBanner />}
    </BrowserRouter>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <AuthProvider>
            <TooltipProvider>
              <AppContent />
              <Toaster />
              <Sonner />
            </TooltipProvider>
          </AuthProvider>
        </HelmetProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
