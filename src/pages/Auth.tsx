import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import SEOHead from '@/components/SEOHead';
import { rateLimiter, SECURITY_CONFIG } from '@/lib/security';
import { logger } from '@/lib/logger';
import { supabase } from '@/integrations/supabase/client';
import { SUBSCRIPTION_TIERS, TierKey } from '@/lib/subscriptionTiers';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [rateLimitMessage, setRateLimitMessage] = useState('');
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Read the optional ?plan= query param (e.g. "basic", "standard", "pro_pi", "pro_estate")
  const planParam = searchParams.get('plan') as TierKey | null;

  /**
   * After authentication, if a plan was selected, trigger Stripe checkout.
   * Otherwise navigate to the dashboard.
   */
  const postAuthRedirect = async () => {
    if (planParam && SUBSCRIPTION_TIERS[planParam]) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: { priceId: SUBSCRIPTION_TIERS[planParam].price_id },
          headers: { Authorization: `Bearer ${session?.access_token}` },
        });
        if (error) throw error;
        if (data?.url) {
          window.open(data.url, '_blank');
          // After opening checkout, send user to dashboard
          navigate('/dashboard');
        }
      } catch (err: any) {
        toast({ title: 'Checkout failed', description: err.message || 'Please try again.', variant: 'destructive' });
        navigate('/dashboard');
      }
    } else {
      navigate('/dashboard');
    }
  };

  // If user is already logged in, handle redirect (including checkout if plan param exists)
  useEffect(() => {
    if (user) {
      postAuthRedirect();
    }
  }, [user]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting check
    const rateLimitKey = `signin_${email}`;
    if (!rateLimiter.isAllowed(rateLimitKey, SECURITY_CONFIG.RATE_LIMITS.AUTH_ATTEMPTS.max, SECURITY_CONFIG.RATE_LIMITS.AUTH_ATTEMPTS.window)) {
      const timeUntilReset = rateLimiter.getTimeUntilReset(rateLimitKey, SECURITY_CONFIG.RATE_LIMITS.AUTH_ATTEMPTS.window);
      const minutesLeft = Math.ceil(timeUntilReset / (60 * 1000));
      setRateLimitMessage(`Too many sign-in attempts. Please try again in ${minutesLeft} minutes.`);
      logger.securityEvent('Rate limit exceeded for sign in', { email });
      return;
    }
    
    setLoading(true);
    setRateLimitMessage('');
    
    const { error } = await signIn(email, password);
    if (!error) {
      // postAuthRedirect is triggered by the useEffect when `user` changes
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting check
    const rateLimitKey = `signup_${email}`;
    if (!rateLimiter.isAllowed(rateLimitKey, SECURITY_CONFIG.RATE_LIMITS.AUTH_ATTEMPTS.max, SECURITY_CONFIG.RATE_LIMITS.AUTH_ATTEMPTS.window)) {
      const timeUntilReset = rateLimiter.getTimeUntilReset(rateLimitKey, SECURITY_CONFIG.RATE_LIMITS.AUTH_ATTEMPTS.window);
      const minutesLeft = Math.ceil(timeUntilReset / (60 * 1000));
      setRateLimitMessage(`Too many sign-up attempts. Please try again in ${minutesLeft} minutes.`);
      logger.securityEvent('Rate limit exceeded for sign up', { email });
      return;
    }
    
    setLoading(true);
    setRateLimitMessage('');
    
    const { error } = await signUp(email, password, displayName);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* SEO meta tags for Auth page */}
      <SEOHead
        title="Sign In | Amicus Edge"
        description="Sign in to your Amicus Edge account to manage your law firm's marketing tools, chatbots, and SEO."
        path="/auth"
      />
      
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Welcome</CardTitle>
          <CardDescription>
            {planParam && SUBSCRIPTION_TIERS[planParam]
              ? `Sign in or create an account to subscribe to the ${SUBSCRIPTION_TIERS[planParam].name} plan`
              : 'Sign in to your account or create a new one'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rateLimitMessage && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
              {rateLimitMessage}
            </div>
          )}
          
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    maxLength={SECURITY_CONFIG.INPUT_LIMITS.EMAIL_MAX_LENGTH}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <PasswordInput
                    id="signin-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={SECURITY_CONFIG.INPUT_LIMITS.PASSWORD_MIN_LENGTH}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Display Name (Optional)</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    maxLength={SECURITY_CONFIG.INPUT_LIMITS.NAME_MAX_LENGTH}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    maxLength={SECURITY_CONFIG.INPUT_LIMITS.EMAIL_MAX_LENGTH}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <PasswordInput
                    id="signup-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={SECURITY_CONFIG.INPUT_LIMITS.PASSWORD_MIN_LENGTH}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating account...' : 'Sign Up'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;