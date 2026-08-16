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
import TurnstileWidget from '@/components/TurnstileWidget';
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

  /**
   * Cloudflare Turnstile state.
   * Supabase Auth CAPTCHA protection requires a single-use token on every
   * sign-in / sign-up call. The two tab panels render independent widgets, so
   * each keeps its own token and its own reset counter (bumping the counter
   * forces the widget to issue a fresh token after a failed attempt).
   */
  const [signInToken, setSignInToken] = useState<string | null>(null);
  const [signUpToken, setSignUpToken] = useState<string | null>(null);
  const [signInReset, setSignInReset] = useState(0);
  const [signUpReset, setSignUpReset] = useState(0);
  // Set when the widget never produces a token (blocked script / offline).
  const [signInCaptchaError, setSignInCaptchaError] = useState(false);
  const [signUpCaptchaError, setSignUpCaptchaError] = useState(false);

  /**
   * Forgot-password flow. Supabase Auth CAPTCHA protection also gates the
   * recovery endpoint, so this reveal-on-click form carries its own independent
   * Turnstile token and reset counter — it must never share the sign-in token.
   */
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [resetSignal, setResetSignal] = useState(0);
  const [resetSending, setResetSending] = useState(false);
  // Neutral confirmation text — never reveals whether the address is registered.
  const [resetSent, setResetSent] = useState(false);

  const { signIn, signUp, resetPassword, user } = useAuth();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Read the optional ?plan= and ?coupon= query params
  const planParam = searchParams.get('plan') as TierKey | null;
  const couponParam = searchParams.get('coupon');

  /**
   * After authentication, if a plan was selected, trigger Stripe checkout.
   * Otherwise navigate to the dashboard.
   */
  const postAuthRedirect = async () => {
    if (planParam && SUBSCRIPTION_TIERS[planParam]) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const body: any = { priceId: SUBSCRIPTION_TIERS[planParam].price_id };
        // Pass coupon if present (e.g. JAX Bar 50% off)
        if (couponParam) body.couponId = couponParam;
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body,
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

  /**
   * If neither widget produced a token within 12 seconds we assume the
   * Turnstile script was blocked (ad blocker / network failure) and surface an
   * explanation instead of leaving the submit buttons silently disabled.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setSignInCaptchaError(!signInToken);
      setSignUpCaptchaError(!signUpToken);
    }, 12000);
    return () => clearTimeout(timer);
    // Re-armed whenever a widget resets so a fresh challenge gets its own grace period.
  }, [signInReset, signUpReset, signInToken, signUpToken]);

  // Clear the "could not load" notice as soon as a token arrives.
  const handleSignInVerify = (token: string | null) => {
    setSignInToken(token);
    if (token) setSignInCaptchaError(false);
  };
  const handleSignUpVerify = (token: string | null) => {
    setSignUpToken(token);
    if (token) setSignUpCaptchaError(false);
  };

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
    
    const { error } = await signIn(email, password, signInToken ?? undefined);
    if (error) {
      // Turnstile tokens are single use — issue a fresh one so the user can retry.
      setSignInToken(null);
      setSignInReset((n) => n + 1);
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
    
    const { error } = await signUp(email, password, displayName, signUpToken ?? undefined);
    if (error) {
      // Turnstile tokens are single use — issue a fresh one so the user can retry.
      setSignUpToken(null);
      setSignUpReset((n) => n + 1);
    }
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
                {/* Cloudflare Turnstile — token is required by Supabase Auth CAPTCHA protection */}
                <TurnstileWidget onVerify={handleSignInVerify} resetSignal={signInReset} />
                {signInCaptchaError && (
                  <p className="text-sm text-destructive">
                    The security check could not load. Please disable any ad blocker or privacy
                    extension, check your connection, and reload the page to try again.
                  </p>
                )}
                <Button type="submit" className="w-full" disabled={loading || !signInToken}>
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
                {/* Cloudflare Turnstile — token is required by Supabase Auth CAPTCHA protection */}
                <TurnstileWidget onVerify={handleSignUpVerify} resetSignal={signUpReset} />
                {signUpCaptchaError && (
                  <p className="text-sm text-destructive">
                    The security check could not load. Please disable any ad blocker or privacy
                    extension, check your connection, and reload the page to try again.
                  </p>
                )}
                <Button type="submit" className="w-full" disabled={loading || !signUpToken}>
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