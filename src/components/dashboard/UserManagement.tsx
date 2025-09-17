import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';
import { Search } from 'lucide-react';

interface UserData {
  id: string;
  user_id: string;
  email: string;
  display_name: string;
  created_at: string;
  user_subscriptions: {
    id: string;
    plan_type: string;
    purchase_date: string;
    cancelled_at: string | null;
    white_label_enabled: boolean;
    features: any;
  }[];
}

export const UserManagement = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        headers: {
          authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-lg">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          View and manage all users and their subscriptions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Purchase Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cancelled Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const subscription = user.user_subscriptions?.[0];
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.display_name || 'N/A'}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {subscription ? (
                        <Badge variant="secondary">
                          {subscription.plan_type}
                        </Badge>
                      ) : (
                        <Badge variant="outline">No package</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {subscription?.purchase_date ? (
                        <span className="text-sm">
                          {formatDistanceToNow(new Date(subscription.purchase_date), { addSuffix: true })}
                        </span>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      {subscription ? (
                        subscription.cancelled_at ? (
                          <Badge variant="destructive">Cancelled</Badge>
                        ) : (
                          <Badge variant="default">Active</Badge>
                        )
                      ) : (
                        <Badge variant="outline">No subscription</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {subscription?.cancelled_at ? (
                        <span className="text-sm">
                          {formatDistanceToNow(new Date(subscription.cancelled_at), { addSuffix: true })}
                        </span>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No users found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};