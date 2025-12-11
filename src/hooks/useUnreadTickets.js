import { useState, useEffect } from 'react';
import axios from '@/lib/axios';

export function useUnreadTickets(userRole = 'admin') {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get('/tickets');
      const tickets = res.data?.data || [];
      
      const totalUnread = tickets.reduce((sum, ticket) => {
        if (userRole === 'admin') {
          return sum + (ticket.unreadByAdmin || 0);
        } else {
          return sum + (ticket.unreadByDeveloper || 0);
        }
      }, 0);

      setUnreadCount(totalUnread);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [userRole]);

  return { unreadCount, refreshUnreadCount: fetchUnreadCount };
}
