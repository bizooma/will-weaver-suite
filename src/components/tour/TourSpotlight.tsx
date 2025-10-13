import React, { useEffect, useState } from 'react';
import { useTourGuide } from '@/contexts/TourGuideContext';

/**
 * Tour Spotlight Component
 * Creates a spotlight effect that highlights specific UI elements during the tour.
 * Overlays the entire screen with a semi-transparent layer and cuts out the target element.
 */

export function TourSpotlight() {
  const { spotlight, clearSpotlight } = useTourGuide();
  const [elementRect, setElementRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (spotlight.active && spotlight.targetElement) {
      const updateRect = () => {
        const element = document.querySelector(spotlight.targetElement!);
        if (element) {
          setElementRect(element.getBoundingClientRect());
        }
      };

      updateRect();
      window.addEventListener('resize', updateRect);
      window.addEventListener('scroll', updateRect, true);

      return () => {
        window.removeEventListener('resize', updateRect);
        window.removeEventListener('scroll', updateRect, true);
      };
    } else {
      setElementRect(null);
    }
  }, [spotlight.active, spotlight.targetElement]);

  if (!spotlight.active || !elementRect) {
    return null;
  }

  const padding = 8; // Extra space around highlighted element

  return (
    <>
      {/* Overlay with cutout */}
      <div
        className="fixed inset-0 z-50 pointer-events-none"
        style={{
          background: `
            linear-gradient(to right, 
              rgba(0, 0, 0, 0.7) 0%, 
              rgba(0, 0, 0, 0.7) ${elementRect.left - padding}px,
              transparent ${elementRect.left - padding}px,
              transparent ${elementRect.right + padding}px,
              rgba(0, 0, 0, 0.7) ${elementRect.right + padding}px,
              rgba(0, 0, 0, 0.7) 100%
            ),
            linear-gradient(to bottom,
              rgba(0, 0, 0, 0.7) 0%,
              rgba(0, 0, 0, 0.7) ${elementRect.top - padding}px,
              transparent ${elementRect.top - padding}px,
              transparent ${elementRect.bottom + padding}px,
              rgba(0, 0, 0, 0.7) ${elementRect.bottom + padding}px,
              rgba(0, 0, 0, 0.7) 100%
            )
          `,
        }}
        onClick={clearSpotlight}
      />

      {/* Highlight border with optional pulse */}
      <div
        className={`fixed z-50 pointer-events-none border-4 border-primary rounded-lg ${
          spotlight.pulse ? 'animate-pulse' : ''
        }`}
        style={{
          left: elementRect.left - padding,
          top: elementRect.top - padding,
          width: elementRect.width + padding * 2,
          height: elementRect.height + padding * 2,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 20px hsl(var(--primary))',
        }}
      />
    </>
  );
}
