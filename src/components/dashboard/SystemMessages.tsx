import { useState, useEffect } from 'react';
import { useDemoSupabase } from '@/hooks/useDemoSupabase';
import { useDemoEdgeFunctions } from '@/hooks/useDemoEdgeFunctions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SystemNotification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  is_active: boolean;
}

export const SystemMessages = () => {
  const supabase = useDemoSupabase();
  const { invoke } = useDemoEdgeFunctions();
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const fetchNotifications = async () => {
    try {
      // For admin view, we need to fetch all notifications, not just user's notifications
      const { data, error } = await supabase
        .from('system_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsCreating(true);
    try {
      const { error } = await invoke('system-notifications', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'content-type': 'application/json'
        },
        body: { title, message }
      });

      if (error) {
        console.error('Error creating notification:', error);
        toast.error('Failed to create notification');
        return;
      }

      toast.success('Notification created successfully');
      setTitle('');
      setMessage('');
      setIsCreateOpen(false);
      fetchNotifications();
    } catch (error) {
      console.error('Error creating notification:', error);
      toast.error('Failed to create notification');
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-lg">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Messages</h1>
          <p className="text-muted-foreground">
            Create and manage system-wide notifications
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Notification
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create System Notification</DialogTitle>
            </DialogHeader>
            <form onSubmit={createNotification} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Notification title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Notification message"
                  rows={4}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Notification'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {notifications.map((notification) => (
          <Card key={notification.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5" />
                  <span>{notification.title}</span>
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{notification.message}</p>
            </CardContent>
          </Card>
        ))}
        {notifications.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No notifications created yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};