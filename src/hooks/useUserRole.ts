import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type UserRole = 'free' | 'admin' | 'moderator' | 'user' | null;

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserRole() {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          setRole('free'); // Default to free if no role found
        } else {
          setRole(data?.role || 'free');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole('free');
      } finally {
        setLoading(false);
      }
    }

    fetchUserRole();
  }, [user]);

  const hasAccess = (requiredRole: UserRole) => {
    if (!role) return false;
    
    // Admin has access to everything
    if (role === 'admin') return true;
    
    // Free users only have access to marketing calendar
    if (role === 'free') {
      return requiredRole === 'free';
    }
    
    // Paid users (user role) have access to everything except admin features
    if (role === 'user') {
      return requiredRole !== 'admin';
    }
    
    // Moderators have access to user features but not admin
    if (role === 'moderator') {
      return requiredRole !== 'admin';
    }
    
    return false;
  };

  const isPaidUser = role === 'user' || role === 'admin' || role === 'moderator';
  const isFreeUser = role === 'free';
  const isAdmin = role === 'admin';

  return {
    role,
    loading,
    hasAccess,
    isPaidUser,
    isFreeUser,
    isAdmin
  };
}