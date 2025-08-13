import { useEffect } from 'react';
import { ENV_CONFIG } from '@/lib/config';
import { performanceMonitor, webVitalsMonitor } from '@/lib/performance';
import { calculatePageScore } from '@/lib/seo';
import { logger } from '@/lib/logger';

// Analytics and monitoring hook
export const useAnalytics = () => {
  useEffect(() => {
    if (!ENV_CONFIG.features.enableAnalytics) return;

    // Track page views
    const trackPageView = () => {
      logger.info('Page view', {
        path: window.location.pathname,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      });
    };

    // Track page performance
    const trackPagePerformance = () => {
      const score = calculatePageScore();
      logger.info('Page performance score', {
        score: score.score,
        recommendations: score.recommendations,
        path: window.location.pathname,
      });
    };

    // Track user engagement
    const trackEngagement = () => {
      let startTime = Date.now();
      let isActive = true;
      let timeOnPage = 0;

      const updateTimeOnPage = () => {
        if (isActive) {
          timeOnPage += Date.now() - startTime;
          startTime = Date.now();
        }
      };

      const handleVisibilityChange = () => {
        if (document.hidden) {
          isActive = false;
          updateTimeOnPage();
        } else {
          isActive = true;
          startTime = Date.now();
        }
      };

      const handleUnload = () => {
        updateTimeOnPage();
        logger.info('User engagement', {
          timeOnPage,
          path: window.location.pathname,
          bounced: timeOnPage < 5000, // Less than 5 seconds = bounce
        });
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('beforeunload', handleUnload);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('beforeunload', handleUnload);
        handleUnload();
      };
    };

    // Initialize tracking
    trackPageView();
    setTimeout(trackPagePerformance, 2000); // Wait for page to load
    const cleanupEngagement = trackEngagement();

    return cleanupEngagement;
  }, []);
};

// Error tracking hook
export const useErrorTracking = () => {
  useEffect(() => {
    if (!ENV_CONFIG.features.enableErrorReporting) return;

    const handleError = (event: ErrorEvent) => {
      logger.error('JavaScript error', new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logger.error('Unhandled promise rejection', event.reason, {
        type: 'unhandled_rejection',
        url: window.location.href,
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
};

// Performance monitoring hook
export const usePerformanceMonitoring = () => {
  useEffect(() => {
    if (!ENV_CONFIG.features.enablePerformanceMonitoring) return;

    // Report performance metrics periodically
    const reportMetrics = () => {
      const metrics = performanceMonitor.getAllMetrics();
      const vitals = webVitalsMonitor.getVitals();
      
      logger.info('Performance metrics', {
        metrics,
        vitals,
        timestamp: new Date().toISOString(),
      });
    };

    // Report every 30 seconds
    const interval = setInterval(reportMetrics, 30000);

    // Report on page unload
    const handleUnload = () => {
      reportMetrics();
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);
};

// A11y monitoring hook
export const useAccessibilityMonitoring = () => {
  useEffect(() => {
    // Check for common accessibility issues
    const checkAccessibility = () => {
      const issues: string[] = [];

      // Check for images without alt text
      const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
      if (imagesWithoutAlt.length > 0) {
        issues.push(`${imagesWithoutAlt.length} images missing alt text`);
      }

      // Check for buttons without accessible names
      const buttonsWithoutText = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
      const emptyButtons = Array.from(buttonsWithoutText).filter(btn => 
        !btn.textContent?.trim() && !btn.querySelector('span')
      );
      if (emptyButtons.length > 0) {
        issues.push(`${emptyButtons.length} buttons without accessible names`);
      }

      // Check for proper heading structure
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const h1Count = document.querySelectorAll('h1').length;
      if (h1Count !== 1) {
        issues.push(`Page has ${h1Count} H1 tags (should have exactly 1)`);
      }

      // Check for form inputs without labels
      const inputsWithoutLabels = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
      const unlabeledInputs = Array.from(inputsWithoutLabels).filter(input => {
        const id = input.getAttribute('id');
        return !id || !document.querySelector(`label[for="${id}"]`);
      });
      if (unlabeledInputs.length > 0) {
        issues.push(`${unlabeledInputs.length} form inputs without labels`);
      }

      // Check color contrast (basic check)
      const elements = document.querySelectorAll('*');
      let lowContrastElements = 0;
      Array.from(elements).forEach(el => {
        const style = window.getComputedStyle(el);
        const textColor = style.color;
        const bgColor = style.backgroundColor;
        
        // This is a simplified check - in production, use a proper contrast ratio calculator
        if (textColor && bgColor && textColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'rgba(0, 0, 0, 0)') {
          // Basic check for obviously bad contrast (white on white, black on black)
          if ((textColor.includes('255, 255, 255') && bgColor.includes('255, 255, 255')) ||
              (textColor.includes('0, 0, 0') && bgColor.includes('0, 0, 0'))) {
            lowContrastElements++;
          }
        }
      });

      if (lowContrastElements > 0) {
        issues.push(`${lowContrastElements} elements with potential color contrast issues`);
      }

      if (issues.length > 0) {
        logger.warn('Accessibility issues detected', { issues, url: window.location.href });
      }
    };

    // Check accessibility after DOM is loaded
    if (document.readyState === 'complete') {
      setTimeout(checkAccessibility, 1000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(checkAccessibility, 1000);
      });
    }
  }, []);
};