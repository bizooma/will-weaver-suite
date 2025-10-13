import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDemoSupabase } from '@/hooks/useDemoSupabase';
import { useDemoEdgeFunctions } from '@/hooks/useDemoEdgeFunctions';

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  user_notifications: { read_at: string | null }[];
}

export const useNotifications = () => {
  const { user } = useAuth();
  const supabase = useDemoSupabase();
  const { invoke } = useDemoEdgeFunctions();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await invoke('system-notifications', {
        headers: {
          authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      const fetchedNotifications = data.notifications || [];
      setNotifications(fetchedNotifications);
      
      const unread = fetchedNotifications.filter(
        (n: Notification) => !n.user_notifications[0]?.read_at
      ).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await invoke('system-notifications', {
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'content-type': 'application/json'
        },
        body: { notificationId }
      });

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, user_notifications: [{ read_at: new Date().toISOString() }] }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Set up realtime subscription for new notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'system_notifications'
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    refetch: fetchNotifications
  };
};