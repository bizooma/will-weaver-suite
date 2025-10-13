import React from 'react';
import { useTourGuide } from '@/contexts/TourGuideContext';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Tour Tooltip Component
 * Displays contextual tooltips during the guided tour.
 * Can be programmatically positioned and shown by the video bot or tour guide.
 */

export function TourTooltip() {
  const { tooltip, hideTooltip } = useTourGuide();

  if (!tooltip.visible) {
    return null;
  }

  return (
    <div
      className="fixed z-[100] bg-card border border-border rounded-lg shadow-2xl p-4 max-w-sm animate-scale-in"
      style={{
        left: tooltip.position.x,
        top: tooltip.position.y,
        transform: 'translate(-50%, -100%) translateY(-12px)',
      }}
    >
      {/* Tooltip arrow */}
      <div
        className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-full w-0 h-0"
        style={{
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '8px solid hsl(var(--border))',
        }}
      />

      <div className="flex items-start gap-3">
        <p className="text-sm text-foreground flex-1">{tooltip.content}</p>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0"
          onClick={hideTooltip}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
