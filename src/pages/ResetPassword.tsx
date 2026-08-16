import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import SEOHead from '@/components/SEOHead';
import { SECURITY_CONFIG } from '@/lib/security';

/**
 * /reset-password
 *
 * Supabase delivers the recovery session in the URL fragment when the user
 * clicks the emailed link. The Supabase client parses that fragment on load and
 * emits a PASSWORD_RECOVERY / SIGNED_IN event, which AuthContext turns into a
 * session. So we wait for auth state to settle (`loading`) before deciding
 * whether the link was valid.
 */
const ResetPassword = () => {
  const { session, loading, updatePassword } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  /**
   * Give the client a brief grace period after `loading` clears: the fragment
   * parse and the resulting state update can land a tick after the initial
   * getSession() resolves. Without this a valid link can briefly look invalid.
   */
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (loading) return;
    if (session) {
      setSettled(true);
      return;
    }
    const timer = setTimeout(() => setSettled(true), 1500);
    return () => clearTimeout(timer);
  }, [loading, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (password !== confirmPassword) {
      setFormError('The two passwords do not match.');
      return;
    }

    setSubmitting(true);
    // Password strength rules live in the shared zod schema (see AuthContext).
    const { error } = await updatePassword(password);
    setSubmitting(false);

    if (!error) {
      navigate('/dashboard');
    }
  };

  // Waiting for the recovery session to be picked up from the URL fragment.
  if (loading || !settled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <p className="text-muted-foreground text-sm">Verifying your reset link…</p>
      </div>
    );
  }

  // No recovery session — the link was never valid, was already used, or expired.
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <SEOHead
          title="Reset Link Expired | Amicus Edge"
          description="Your Amicus Edge password reset link is invalid or has expired. Request a new reset link to regain access to your law firm marketing dashboard."
          path="/reset-password"
        />
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Invalid or expired reset link</CardTitle>
            <CardDescription>
              This password reset link is no longer valid. Reset links can only be used once and
              expire after a short time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/auth">Back to sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <SEOHead
        title="Choose a New Password | Amicus Edge"
        description="Set a new password for your Amicus Edge account and get back to managing your law firm's AI visibility, chatbots, and marketing tools."
        path="/reset-password"
      />
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Choose a new password</CardTitle>
          <CardDescription>
            Enter a new password for your Amicus Edge account. You'll be signed in right after.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <PasswordInput
                id="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={SECURITY_CONFIG.INPUT_LIMITS.PASSWORD_MIN_LENGTH}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <PasswordInput
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={SECURITY_CONFIG.INPUT_LIMITS.PASSWORD_MIN_LENGTH}
                required
              />
            </div>
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Updating password…' : 'Update password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
