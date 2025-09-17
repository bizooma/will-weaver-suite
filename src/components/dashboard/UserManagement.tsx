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
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { formatDistanceToNow } from 'date-fns';
import { Search, MoreHorizontal, UserPlus, Pause, Play, Trash2 } from 'lucide-react';
import { AddUserDialog } from './AddUserDialog';
import { useToast } from '@/hooks/use-toast';

interface UserData {
  id: string;
  user_id: string;
  email: string;
  display_name: string;
  created_at: string;
  account_status?: string;
  last_login?: string;
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
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const { toast } = useToast();

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

  const handleUserAction = async (userId: string, action: 'pause' | 'activate' | 'delete') => {
    try {
      const status = action === 'pause' ? 'paused' : action === 'activate' ? 'active' : 'deleted';
      
      const { error } = await supabase.functions.invoke('admin-manage-user', {
        body: {
          action: 'updateStatus',
          userId,
          status
        },
        headers: {
          authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: `User ${action}d successfully`
      });
      
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: `Failed to ${action} user`,
        variant: "destructive"
      });
    }
  };

  const openDeleteDialog = (user: UserData) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      handleUserAction(selectedUser.user_id, 'delete');
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    // Always put joe@bizooma.com first
    if (a.email === 'joe@bizooma.com') return -1;
    if (b.email === 'joe@bizooma.com') return 1;
    return 0;
  });

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
          <div className="flex items-center justify-between">
            <CardTitle>All Users</CardTitle>
            <Button onClick={() => setAddUserOpen(true)} className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add User
            </Button>
          </div>
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
                <TableHead>Last Login</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Purchase Date</TableHead>
                <TableHead>Account Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const subscription = user.user_subscriptions?.[0];
                const accountStatus = user.account_status || 'active';
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.display_name || 'N/A'}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.last_login ? (
                        <span className="text-sm">
                          {formatDistanceToNow(new Date(user.last_login), { addSuffix: true })}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {subscription ? (
                        <Badge variant={subscription.cancelled_at ? "destructive" : "secondary"}>
                          {subscription.plan_type}
                          {subscription.cancelled_at && " (Cancelled)"}
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
                      <Badge 
                        variant={accountStatus === 'active' ? 'default' : 
                               accountStatus === 'paused' ? 'secondary' : 'destructive'}
                      >
                        {accountStatus.charAt(0).toUpperCase() + accountStatus.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.email === 'joe@bizooma.com' ? (
                        // No actions for platform owner
                        <span className="text-muted-foreground text-sm">Platform Owner</span>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {accountStatus === 'paused' ? (
                              <DropdownMenuItem onClick={() => handleUserAction(user.user_id, 'activate')}>
                                <Play className="mr-2 h-4 w-4" />
                                Activate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleUserAction(user.user_id, 'pause')}>
                                <Pause className="mr-2 h-4 w-4" />
                                Pause
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => openDeleteDialog(user)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

      <AddUserDialog 
        open={addUserOpen} 
        onOpenChange={setAddUserOpen}
        onUserAdded={fetchUsers}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account for{' '}
              <strong>{selectedUser?.display_name || selectedUser?.email}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};