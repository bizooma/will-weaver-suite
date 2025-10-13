import React, { createContext, useContext, useState } from 'react';

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
    // Toast notification for demo interactions
    console.log('[Demo Mode]:', message);
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
  if (context === undefined) {
    throw new Error('useDemoMode must be used within a DemoModeProvider');
  }
  return context;
}
