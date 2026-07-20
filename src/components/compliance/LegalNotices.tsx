import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Info } from 'lucide-react';

// GDPR compliance notice component
export const GDPRNotice: React.FC = () => {
  return (
    <Alert className="mb-4" data-gdpr-notice>
      <Shield className="h-4 w-4" />
      <AlertDescription>
        <strong>Your Privacy Matters:</strong> We process your personal data in accordance with GDPR. 
        You have the right to access, rectify, or delete your data at any time.{' '}
        <a href="/privacy" className="text-primary hover:underline">Learn more</a>
      </AlertDescription>
    </Alert>
  );
};

// Legal disclaimer component
export const LegalDisclaimer: React.FC<{ variant?: 'banner' | 'inline' | 'modal' }> = ({ 
  variant = 'inline' 
}) => {
  if (variant === 'banner') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="text-red-800">
            <h3 className="font-semibold mb-1">Important Legal Notice</h3>
            <p className="text-sm">
              This platform is for <strong>demonstration purposes only</strong>. 
              Documents generated should NOT be used for actual legal purposes without 
              review by a qualified attorney. We do not provide legal advice.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="text-xs text-muted-foreground bg-amber-50 border border-amber-200 rounded p-2">
        <strong>Demo Only:</strong> Not for actual legal use. Consult a qualified attorney for legal advice.
      </div>
    );
  }

  return null;
};
