import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

export const NotificationIcon = () => {
  const { notifications, unreadCount, markAsRead } = useNotifications();

  const handleNotificationClick = (notificationId: string, hasRead: boolean) => {
    if (!hasRead) {
      markAsRead(notificationId);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <DropdownMenuItem disabled>
            No notifications
          </DropdownMenuItem>
        ) : (
          notifications.map((notification) => {
            const isRead = notification.user_notifications[0]?.read_at;
            return (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start p-4 cursor-pointer"
                onClick={() => handleNotificationClick(notification.id, !!isRead)}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`font-medium ${!isRead ? 'text-primary' : 'text-muted-foreground'}`}>
                    {notification.title}
                  </span>
                  {!isRead && (
                    <div className="h-2 w-2 bg-primary rounded-full ml-2" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {notification.message}
                </p>
                <span className="text-xs text-muted-foreground mt-2">
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </span>
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};