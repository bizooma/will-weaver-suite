import React from 'react';
import { useTourGuide } from '@/contexts/TourGuideContext';
import { CheckCircle2, Circle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

/**
 * Tour Progress Component
 * Shows visual progress through the guided tour with step indicators.
 * Displays completed steps and current position in the tour.
 */

interface TourProgressProps {
  compact?: boolean;
}

export function TourProgress({ compact = false }: TourProgressProps) {
  const { currentStep, totalSteps, steps } = useTourGuide();
  const completedSteps = steps.filter(s => s.completed).length;
  const progressPercent = (completedSteps / totalSteps) * 100;

  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
        <span className="text-xs font-medium text-muted-foreground">
          Tour Progress:
        </span>
        <Progress value={progressPercent} className="w-24 h-2" />
        <span className="text-xs font-medium">
          {completedSteps}/{totalSteps}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Tour Progress</h3>
        <span className="text-xs text-muted-foreground">
          {completedSteps} of {totalSteps} completed
        </span>
      </div>

      <Progress value={progressPercent} className="h-2" />

      <div className="space-y-2">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-start gap-3 text-sm ${
              index === currentStep ? 'text-primary font-medium' : 'text-muted-foreground'
            }`}
          >
            {step.completed ? (
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            ) : (
              <Circle className="h-5 w-5 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-medium">{step.title}</p>
              <p className="text-xs text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
