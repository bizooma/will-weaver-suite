import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  X, 
  Cookie, 
  Shield, 
  Info,
  Settings,
  CheckCircle
} from 'lucide-react';
import { cookieManager, type CookieConsent } from '@/lib/compliance';
import { logger } from '@/lib/logger';

interface CookieConsentBannerProps {
  onAccept?: () => void;
  onDecline?: () => void;
}

const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onAccept, onDecline }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState<Omit<CookieConsent, 'timestamp' | 'version'>>({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Show banner if consent is needed
    if (cookieManager.needsConsent()) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const fullConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    
    cookieManager.setConsent(fullConsent);
    setIsVisible(false);
    onAccept?.();
    
    logger.info('User accepted all cookies');
  };

  const handleAcceptSelected = () => {
    cookieManager.setConsent(consent);
    setIsVisible(false);
    onAccept?.();
    
    logger.info('User accepted selected cookies', { consent });
  };

  const handleDeclineAll = () => {
    const minimalConsent = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    
    cookieManager.setConsent(minimalConsent);
    setIsVisible(false);
    onDecline?.();
    
    logger.info('User declined optional cookies');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur border-t shadow-lg">
      <div className="container mx-auto max-w-6xl">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cookie className="h-5 w-5" />
                <CardTitle className="text-lg">Cookie Preferences</CardTitle>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsVisible(false)}
                aria-label="Close cookie banner"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              We use cookies to improve your experience, analyze site usage, and assist in marketing efforts. 
              You can customize your preferences below.
            </div>

            {!showDetails ? (
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleAcceptAll}>
                  Accept All Cookies
                </Button>
                <Button variant="outline" onClick={handleDeclineAll}>
                  Decline Optional
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowDetails(true)}
                  className="flex items-center gap-1"
                >
                  <Settings className="h-4 w-4" />
                  Customize
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4">
                  {/* Necessary Cookies */}
                  <div className="flex items-center justify-between p-3 rounded border">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">Necessary Cookies</h4>
                        <Badge variant="secondary">Required</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Essential for the website to function properly. Cannot be disabled.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <Switch checked={true} disabled />
                    </div>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="flex items-center justify-between p-3 rounded border">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">Analytics Cookies</h4>
                        <Badge variant="outline">Optional</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Help us understand how visitors use our website to improve performance.
                      </p>
                    </div>
                    <Switch 
                      checked={consent.analytics}
                      onCheckedChange={(checked) => 
                        setConsent(prev => ({ ...prev, analytics: checked }))
                      }
                    />
                  </div>

                  {/* Marketing Cookies */}
                  <div className="flex items-center justify-between p-3 rounded border">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">Marketing Cookies</h4>
                        <Badge variant="outline">Optional</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Used to deliver relevant advertisements and track ad effectiveness.
                      </p>
                    </div>
                    <Switch 
                      checked={consent.marketing}
                      onCheckedChange={(checked) => 
                        setConsent(prev => ({ ...prev, marketing: checked }))
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button onClick={handleAcceptSelected}>
                    Save Preferences
                  </Button>
                  <Button variant="outline" onClick={handleAcceptAll}>
                    Accept All
                  </Button>
                  <Button variant="ghost" onClick={() => setShowDetails(false)}>
                    Back
                  </Button>
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              Learn more in our{' '}
              <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
              {' '}and{' '}
              <a href="/cookies" className="text-primary hover:underline">Cookie Policy</a>.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

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

export default CookieConsentBanner;