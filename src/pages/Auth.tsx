import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Helmet } from 'react-helmet-async';
import { rateLimiter, SECURITY_CONFIG } from '@/lib/security';
import { logger } from '@/lib/logger';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [rateLimitMessage, setRateLimitMessage] = useState('');
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

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
      navigate('/dashboard');
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
      <Helmet>
        <title>Sign In | Legal AI Assistant</title>
        <meta name="description" content="Sign in to your Legal AI Assistant account to create and manage your legal documents." />
      </Helmet>
      
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Welcome</CardTitle>
          <CardDescription>Sign in to your account or create a new one</CardDescription>
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