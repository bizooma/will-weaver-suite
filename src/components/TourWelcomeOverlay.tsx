import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Play, X } from "lucide-react";

/**
 * Tour Welcome Overlay Component
 * Displays an introductory message when users first enter the dashboard tour.
 * Provides quick tips and start/skip options for the interactive experience.
 */

interface TourWelcomeOverlayProps {
  open: boolean;
  onClose: () => void;
}

export const TourWelcomeOverlay: React.FC<TourWelcomeOverlayProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl">Welcome to the Amicus Edge Platform Tour</DialogTitle>
          </div>
          <DialogDescription className="text-base space-y-4 pt-4">
            <p>
              See how leading law firms are using Amicus Edge to transform their marketing and client engagement.
              Explore our full platform in under 5 minutes—no signup required.
            </p>
            
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Play className="h-4 w-4" />
                Quick Tips:
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Click on any feature in the sidebar to explore it with live demo data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Try creating chatbots, generating QR codes, analyzing SEO—everything works!</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Your changes won't be saved, but you'll get the full experience</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Ready to keep your work? Sign up anytime using the banner at the top</span>
                </li>
              </ul>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-3 mt-6">
          <Button
            onClick={onClose}
            variant="hero"
            size="lg"
            className="flex-1"
          >
            <Play className="mr-2 h-5 w-5" />
            Start Exploring
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            size="lg"
          >
            <X className="mr-2 h-4 w-4" />
            Skip
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
