
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import WillCreator from "./pages/WillCreator";
import Alexa from "./pages/Alexa";
import MobileApp from "./pages/MobileApp";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import SiteHeader from "./components/layout/SiteHeader";
import SiteFooter from "./components/layout/SiteFooter";
import ChatbotWidget from "./components/ChatbotWidget";
import VoiceAgentBar from "./components/VoiceAgentBar";
import DraftSave from "./pages/DraftSave";
import DraftView from "./pages/DraftView";

const queryClient = new QueryClient();

const App = () => {
  const isEmbed = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('embed') === '1';
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
              {!isEmbed && <SiteHeader />}
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/will-creator" element={
                  <ProtectedRoute>
                    <WillCreator />
                  </ProtectedRoute>
                } />
                <Route path="/alexa" element={<Alexa />} />
                <Route path="/mobile-app" element={<MobileApp />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/drafts/save" element={
                  <ProtectedRoute>
                    <DraftSave />
                  </ProtectedRoute>
                } />
                <Route path="/drafts/:slug" element={<DraftView />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              {!isEmbed && <SiteFooter />}
              {!isEmbed && <VoiceAgentBar agentId="bQYvVXsrFk4WxoQMcYno" />}
              {!isEmbed && <ChatbotWidget />}
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </HelmetProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
