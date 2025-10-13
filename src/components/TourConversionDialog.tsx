import React from 'react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

/**
 * Tour Conversion Dialog
 * Prompts visitors to sign up after exploring the tour.
 * Shows personalized message based on features they explored.
 */

interface TourConversionDialogProps {
  open: boolean;
  onClose: () => void;
  featuresExplored?: string[];
}

export const TourConversionDialog: React.FC<TourConversionDialogProps> = ({
  open,
  onClose,
  featuresExplored = [],
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Ready to Get Started?</DialogTitle>
          <DialogDescription className="text-base pt-2">
            {featuresExplored.length > 0 ? (
              <>
                You've explored <strong>{featuresExplored.length}</strong> feature
                {featuresExplored.length !== 1 ? 's' : ''}. Sign up now to start using
                Amicus Edge for your law firm.
              </>
            ) : (
              <>
                Sign up now to access all features and start growing your law firm's online presence.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {featuresExplored.length > 0 && (
          <div className="py-4">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Features you explored:
            </p>
            <div className="space-y-2">
              {featuresExplored.slice(0, 5).map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>{feature}</span>
                </div>
              ))}
              {featuresExplored.length > 5 && (
                <p className="text-sm text-muted-foreground pl-6">
                  +{featuresExplored.length - 5} more
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 pt-4">
          <Button asChild size="lg" className="w-full">
            <Link to="/auth">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" onClick={onClose} className="w-full">
            Continue Exploring
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground pt-2">
          No credit card required • Full access to all features
        </p>
      </DialogContent>
    </Dialog>
  );
};
