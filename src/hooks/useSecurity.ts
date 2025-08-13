import { useEffect } from 'react';
import { logger } from '@/lib/logger';

// Security monitoring hook
export const useSecurityMonitoring = () => {
  useEffect(() => {
    // Monitor for potential XSS attempts
    const originalDocumentWrite = document.write;
    document.write = function(content: string) {
      logger.securityEvent('Suspicious document.write detected', { content });
      return originalDocumentWrite.call(this, content);
    };

    // Monitor for suspicious console access
    const originalConsoleLog = console.log;
    let suspiciousConsoleAttempts = 0;
    
    console.log = function(...args: any[]) {
      // Detect if someone is trying to access sensitive data via console
      const stringArgs = args.join(' ').toLowerCase();
      if (stringArgs.includes('password') || stringArgs.includes('token') || stringArgs.includes('secret')) {
        suspiciousConsoleAttempts++;
        if (suspiciousConsoleAttempts > 2) {
          logger.securityEvent('Multiple suspicious console access attempts detected');
        }
      }
      return originalConsoleLog.apply(this, args);
    };

    // Monitor for DevTools opening (basic detection)
    let devtools = { open: false, orientation: null };
    setInterval(() => {
      if (window.outerHeight - window.innerHeight > 200 || window.outerWidth - window.innerWidth > 200) {
        if (!devtools.open) {
          devtools.open = true;
          logger.securityEvent('DevTools opened');
        }
      } else {
        devtools.open = false;
      }
    }, 500);

    // Monitor for tab visibility changes (potential screen recording)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logger.info('Tab became hidden');
      } else {
        logger.info('Tab became visible');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      document.write = originalDocumentWrite;
      console.log = originalConsoleLog;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
};

// Hook for detecting suspicious activity
export const useSuspiciousActivityDetection = () => {
  useEffect(() => {
    let rapidClickCount = 0;
    let lastClickTime = 0;

    const handleClick = () => {
      const now = Date.now();
      if (now - lastClickTime < 100) { // Less than 100ms between clicks
        rapidClickCount++;
        if (rapidClickCount > 10) {
          logger.securityEvent('Rapid clicking detected - possible bot activity');
          rapidClickCount = 0; // Reset after logging
        }
      } else {
        rapidClickCount = 0;
      }
      lastClickTime = now;
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);
};