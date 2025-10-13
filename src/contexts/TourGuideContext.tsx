import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Tour Guide Context
 * Provides programmatic control for the guided tour experience.
 * Enables video bot or other guides to highlight elements, show tooltips,
 * navigate between sections, and track progress.
 */

interface TourStep {
  id: string;
  title: string;
  description: string;
  route?: string;
  elementSelector?: string;
  completed?: boolean;
}

interface TooltipState {
  visible: boolean;
  content: string;
  position: { x: number; y: number };
  targetElement?: string;
}

interface SpotlightState {
  active: boolean;
  targetElement?: string;
  pulse?: boolean;
}

interface TourGuideContextType {
  // Spotlight control
  spotlight: SpotlightState;
  setSpotlight: (state: SpotlightState) => void;
  highlightElement: (selector: string, pulse?: boolean) => void;
  clearSpotlight: () => void;
  
  // Tooltip control
  tooltip: TooltipState;
  showTooltip: (content: string, position: { x: number; y: number }, targetElement?: string) => void;
  hideTooltip: () => void;
  
  // Navigation control
  navigateToSection: (route: string) => void;
  scrollToElement: (selector: string) => void;
  
  // Progress tracking
  currentStep: number;
  totalSteps: number;
  steps: TourStep[];
  completeStep: (stepId: string) => void;
  setCurrentStep: (step: number) => void;
}

const TourGuideContext = createContext<TourGuideContextType | undefined>(undefined);

const defaultSteps: TourStep[] = [
  { id: 'welcome', title: 'Welcome', description: 'Welcome to the platform tour' },
  { id: 'chatbots', title: 'Video Chatbots', description: 'Explore AI chatbot features', route: '/dashboard-tour/chatbots' },
  { id: 'voice-search', title: 'Voice Search', description: 'Try voice search optimization', route: '/dashboard-tour/voice-search' },
  { id: 'qr-codes', title: 'QR Codes', description: 'Generate trackable QR codes', route: '/dashboard-tour/qr-codes' },
  { id: 'marketing', title: 'Marketing Calendar', description: 'View marketing events', route: '/dashboard-tour/marketing-calendar' },
  { id: 'complete', title: 'Tour Complete', description: 'Ready to get started?' },
];

export function TourGuideProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [spotlight, setSpotlight] = useState<SpotlightState>({ active: false });
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, content: '', position: { x: 0, y: 0 } });
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<TourStep[]>(defaultSteps);

  // Highlight element with optional pulse animation
  const highlightElement = useCallback((selector: string, pulse = true) => {
    setSpotlight({ active: true, targetElement: selector, pulse });
    
    // Auto-scroll to element
    setTimeout(() => {
      const element = document.querySelector(selector);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }, []);

  const clearSpotlight = useCallback(() => {
    setSpotlight({ active: false });
  }, []);

  // Show tooltip at specific position
  const showTooltip = useCallback((content: string, position: { x: number; y: number }, targetElement?: string) => {
    setTooltip({ visible: true, content, position, targetElement });
  }, []);

  const hideTooltip = useCallback(() => {
    setTooltip({ visible: false, content: '', position: { x: 0, y: 0 } });
  }, []);

  // Navigate to tour section
  const navigateToSection = useCallback((route: string) => {
    navigate(route);
  }, [navigate]);

  // Scroll to element smoothly
  const scrollToElement = useCallback((selector: string) => {
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  // Complete a step and update progress
  const completeStep = useCallback((stepId: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed: true } : step
    ));
  }, []);

  const totalSteps = steps.length;

  return (
    <TourGuideContext.Provider
      value={{
        spotlight,
        setSpotlight,
        highlightElement,
        clearSpotlight,
        tooltip,
        showTooltip,
        hideTooltip,
        navigateToSection,
        scrollToElement,
        currentStep,
        totalSteps,
        steps,
        completeStep,
        setCurrentStep,
      }}
    >
      {children}
    </TourGuideContext.Provider>
  );
}

export function useTourGuide() {
  const context = useContext(TourGuideContext);
  if (context === undefined) {
    throw new Error('useTourGuide must be used within a TourGuideProvider');
  }
  return context;
}
