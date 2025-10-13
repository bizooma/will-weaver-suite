import React, { createContext, useContext, useState } from 'react';
import { toast } from '@/components/ui/use-toast';

/**
 * Demo Mode Context
 * Provides demo state management for the interactive dashboard tour.
 * When enabled, all database operations are intercepted and mock data is returned.
 */

interface DemoModeContextType {
  isDemoMode: boolean;
  enableDemoMode: () => void;
  disableDemoMode: () => void;
  showDemoToast: (message: string) => void;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

export function DemoModeProvider({ children }: { children: React.ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false);

  const enableDemoMode = () => setIsDemoMode(true);
  const disableDemoMode = () => setIsDemoMode(false);
  
  const showDemoToast = (message: string) => {
    toast({
      title: "Demo Mode",
      description: message,
      duration: 2000,
    });
  };

  return (
    <DemoModeContext.Provider
      value={{
        isDemoMode,
        enableDemoMode,
        disableDemoMode,
        showDemoToast,
      }}
    >
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const context = useContext(DemoModeContext);
  
  // Return safe defaults when called outside provider (e.g., in global components)
  if (context === undefined) {
    return {
      isDemoMode: false,
      enableDemoMode: () => {},
      disableDemoMode: () => {},
      showDemoToast: () => {},
    };
  }
  
  return context;
}
