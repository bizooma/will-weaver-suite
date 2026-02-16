import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { signUpSchema, signInSchema, sanitizeEmail, sanitizeString } from '@/lib/validation';
import { logger } from '@/lib/logger';
import { getTierByProductId, SUBSCRIPTION_TIERS } from '@/lib/subscriptionTiers';

// Extended context type including subscription state
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  subscriptionStatus: 'loading' | 'active' | 'inactive';
  subscriptionTier: string | null;
  subscriptionEnd: string | null;
  refreshSubscription: () => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  // Subscription state: status, tier name, and end date
  const [subscriptionStatus, setSubscriptionStatus] = useState<'loading' | 'active' | 'inactive'>('loading');
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const { toast } = useToast();

  // Update last login timestamp in profiles table
  const updateLastLogin = async (userId: string) => {
    try {
      await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('user_id', userId);
    } catch (error) {
      logger.error('Failed to update last login', error);
    }
  };

  // Check subscription status by calling the check-subscription edge function
  const refreshSubscription = useCallback(async () => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession?.access_token) {
        setSubscriptionStatus('inactive');
        setSubscriptionTier(null);
        setSubscriptionEnd(null);
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${currentSession.access_token}`,
        },
      });

      if (error) {
        logger.error('Failed to check subscription', error);
        setSubscriptionStatus('inactive');
        return;
      }

      if (data?.subscribed) {
        setSubscriptionStatus('active');
        // Resolve product ID to a human-readable tier name
        const tierKey = getTierByProductId(data.product_id);
        setSubscriptionTier(tierKey ? SUBSCRIPTION_TIERS[tierKey].name : 'Unknown');
        setSubscriptionEnd(data.subscription_end);
      } else {
        setSubscriptionStatus('inactive');
        setSubscriptionTier(null);
        setSubscriptionEnd(null);
      }
    } catch (error) {
      logger.error('Subscription check error', error);
      setSubscriptionStatus('inactive');
    }
  }, []);

  // Auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(() => updateLastLogin(session.user.id), 0);
          // Refresh subscription after sign in
          setTimeout(() => refreshSubscription(), 500);
        }

        if (event === 'SIGNED_OUT') {
          setSubscriptionStatus('inactive');
          setSubscriptionTier(null);
          setSubscriptionEnd(null);
        }
      }
    );

    // Check existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        refreshSubscription();
      } else {
        setSubscriptionStatus('inactive');
      }
    });

    return () => subscription.unsubscribe();
  }, [refreshSubscription]);

  // Auto-refresh subscription status every 60 seconds while user is logged in
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(refreshSubscription, 60000);
    return () => clearInterval(interval);
  }, [user, refreshSubscription]);

  // --- Sign Up ---
  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const sanitizedEmail = sanitizeEmail(email);
      const sanitizedDisplayName = displayName ? sanitizeString(displayName) : undefined;
      
      const validationResult = signUpSchema.safeParse({
        email: sanitizedEmail,
        password,
        displayName: sanitizedDisplayName,
      });

      if (!validationResult.success) {
        const errorMessage = validationResult.error.errors[0]?.message || 'Invalid input';
        toast({ title: "Validation Error", description: errorMessage, variant: "destructive" });
        logger.warn('Sign up validation failed', { email: sanitizedEmail, errors: validationResult.error.errors });
        return { error: new Error(errorMessage) };
      }

      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: sanitizedDisplayName ? { display_name: sanitizedDisplayName } : undefined
        }
      });
      
      if (error) {
        logger.error('Sign up failed', error, { email: sanitizedEmail });
        toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
      } else {
        logger.info('User signed up successfully', { email: sanitizedEmail });
        toast({ title: "Check your email", description: "We've sent you a confirmation link to complete your signup." });
      }
      
      return { error };
    } catch (error: any) {
      logger.error('Unexpected sign up error', error);
      toast({ title: "An error occurred", description: "Please try again later.", variant: "destructive" });
      return { error };
    }
  };

  // --- Sign In ---
  const signIn = async (email: string, password: string) => {
    try {
      const sanitizedEmail = sanitizeEmail(email);
      const validationResult = signInSchema.safeParse({ email: sanitizedEmail, password });

      if (!validationResult.success) {
        const errorMessage = validationResult.error.errors[0]?.message || 'Invalid input';
        toast({ title: "Validation Error", description: errorMessage, variant: "destructive" });
        logger.warn('Sign in validation failed', { email: sanitizedEmail, errors: validationResult.error.errors });
        return { error: new Error(errorMessage) };
      }

      const { error } = await supabase.auth.signInWithPassword({ email: sanitizedEmail, password });
      
      if (error) {
        logger.warn('Sign in failed', { email: sanitizedEmail, error: error.message });
        toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
      } else {
        logger.info('User signed in successfully', { email: sanitizedEmail });
      }
      
      return { error };
    } catch (error: any) {
      logger.error('Unexpected sign in error', error);
      toast({ title: "An error occurred", description: "Please try again later.", variant: "destructive" });
      return { error };
    }
  };

  // --- Sign Out ---
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        logger.error('Sign out failed', error);
        toast({ title: "Sign out failed", description: error.message, variant: "destructive" });
      } else {
        logger.info('User signed out successfully');
      }
    } catch (error: any) {
      logger.error('Unexpected sign out error', error);
      toast({ title: "An error occurred", description: "Please try again later.", variant: "destructive" });
    }
  };

  const value = {
    user,
    session,
    loading,
    subscriptionStatus,
    subscriptionTier,
    subscriptionEnd,
    refreshSubscription,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
