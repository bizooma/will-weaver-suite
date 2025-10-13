import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Tour Tracking Hook
 * Tracks user engagement during the dashboard tour to understand
 * which features visitors explore most.
 */

interface TourEvent {
  feature: string;
  timestamp: number;
  path: string;
}

export function useTourTracking() {
  const location = useLocation();

  useEffect(() => {
    // Track feature visits during tour
    const trackFeatureVisit = () => {
      const tourEvents: TourEvent[] = JSON.parse(
        sessionStorage.getItem('tour-events') || '[]'
      );

      const featureName = getFeatureName(location.pathname);
      
      if (featureName) {
        const event: TourEvent = {
          feature: featureName,
          timestamp: Date.now(),
          path: location.pathname,
        };

        tourEvents.push(event);
        sessionStorage.setItem('tour-events', JSON.stringify(tourEvents));

        // Log for analytics (could integrate with Google Analytics, etc.)
        console.log('Tour feature visited:', featureName);
      }
    };

    trackFeatureVisit();
  }, [location.pathname]);

  return {
    getTourEvents: () => {
      return JSON.parse(sessionStorage.getItem('tour-events') || '[]') as TourEvent[];
    },
    clearTourEvents: () => {
      sessionStorage.removeItem('tour-events');
    },
  };
}

/**
 * Maps dashboard paths to feature names for analytics
 */
function getFeatureName(path: string): string {
  const featureMap: Record<string, string> = {
    '/dashboard-tour': 'Overview',
    '/dashboard-tour/aio': 'AIO Analyzer',
    '/dashboard-tour/chatbots': 'Video Chatbots',
    '/dashboard-tour/live-operators': 'Live Operators',
    '/dashboard-tour/voice-search': 'Voice Search',
    '/dashboard-tour/qr-codes': 'QR Codes',
    '/dashboard-tour/marketing-calendar': 'Marketing Calendar',
    '/dashboard-tour/nonprofit-formation': 'Nonprofit Formation',
    '/dashboard-tour/wills': 'Will Creator',
    '/dashboard-tour/alexa': 'Alexa Skill',
    '/dashboard-tour/mobile': 'Mobile App',
    '/dashboard-tour/training': 'Training Videos',
    '/dashboard-tour/users': 'User Management',
    '/dashboard-tour/system-messages': 'System Messages',
    '/dashboard-tour/analytics': 'Analytics',
    '/dashboard-tour/settings': 'Settings',
  };

  return featureMap[path] || '';
}
