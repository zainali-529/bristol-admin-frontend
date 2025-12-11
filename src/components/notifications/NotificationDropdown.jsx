import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '@/lib/axios';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Bell, Ticket, CheckCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

function NotificationDropdown({ userRole = 'admin' }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/tickets');
      const tickets = res.data?.data || [];
      
      const unreadTickets = tickets.filter((ticket) => {
        const unread = userRole === 'admin' ? ticket.unreadByAdmin : ticket.unreadByDeveloper;
        return unread > 0;
      });

      const notifs = unreadTickets.map((ticket) => ({
        id: ticket._id,
        ticketId: ticket._id,
        title: ticket.title,
        message: `${ticket.unreadByAdmin || ticket.unreadByDeveloper} new ${
          (ticket.unreadByAdmin || ticket.unreadByDeveloper) > 1 ? 'replies' : 'reply'
        }`,
        time: ticket.lastReplyAt || ticket.updatedAt,
        priority: ticket.priority,
        status: ticket.status,
      }));

      setNotifications(notifs);
      setUnreadCount(notifs.length);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userRole]);

  const markAllAsRead = async () => {
    try {
      await Promise.all(
        notifications.map((notif) => axios.patch(`/tickets/${notif.ticketId}/read`))
      );
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white font-semibold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications ({unreadCount})</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-6 text-xs"
            >
              <CheckCheck className="size-3 mr-1" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No new notifications
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            {notifications.map((notif) => (
              <DropdownMenuItem key={notif.id} asChild className="cursor-pointer">
                <Link
                  to={`/tickets/${notif.ticketId}`}
                  className="flex items-start gap-3 p-3 hover:bg-muted/50"
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Ticket className="size-4 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{notif.title}</p>
                    <p className="text-xs text-muted-foreground">{notif.message}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          notif.priority === 'critical'
                            ? 'border-red-500 text-red-700'
                            : notif.priority === 'high'
                            ? 'border-orange-500 text-orange-700'
                            : 'border-gray-300 text-gray-700'
                        }`}
                      >
                        {notif.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notif.time), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </Link>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default NotificationDropdown;
