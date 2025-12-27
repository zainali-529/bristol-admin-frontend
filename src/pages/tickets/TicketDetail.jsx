import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Edit, Loader2, Bell } from 'lucide-react';
import StatusBadge from '@/components/tickets/StatusBadge';
import MessageBubble from '@/components/tickets/MessageBubble';
import ReplyInput from '@/components/tickets/ReplyInput';
import EditTicketDialog from '@/components/tickets/EditTicketDialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadTicket = async () => {
    try {
      const res = await axios.get(`/tickets/${id}`);
      setTicket(res.data?.data);
      
      await axios.patch(`/tickets/${id}/read`);
    } catch (err) {
      console.error('Failed to load ticket:', err);
      toast.error('Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleNotification = async (checked) => {
    try {
      const res = await axios.put(`/tickets/${id}/toggle-notification`);
      if (res.data.success) {
        setTicket(prev => ({
          ...prev,
          notificationPreferences: res.data.data
        }));
        toast.success(`Email notifications ${checked ? 'enabled' : 'disabled'}`);
      }
    } catch (err) {
      console.error('Failed to toggle notification:', err);
      toast.error('Failed to update notification preferences');
    }
  };

  useEffect(() => {
    if (id) {
      loadTicket();
    }
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [ticket?.comments]);

  const handleReplySent = (newComment) => {
    if (ticket && newComment) {
      setTicket({
        ...ticket,
        comments: [...ticket.comments, newComment],
      });
    }
    loadTicket();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">Ticket not found</p>
        <Button onClick={() => navigate('/tickets')} className="mt-4">
          Back to Tickets
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/tickets')}>
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {ticket.title}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Created by {ticket.createdBy?.name} on {new Date(ticket.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StatusBadge status={ticket.status} userRole="admin" />
              <Badge 
                variant="outline"
                className={
                  ticket.priority === 'critical' ? 'border-red-500 text-red-700' :
                  ticket.priority === 'high' ? 'border-orange-500 text-orange-700' :
                  'border-gray-300 text-gray-700'
                }
              >
                {ticket.priority}
              </Badge>
              <Badge variant="outline">{ticket.category}</Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 border-r pr-4 mr-2" style={{ borderColor: 'var(--border)' }}>
                <Switch 
                  id="email-notifications" 
                  checked={ticket.notificationPreferences?.admin ?? true} 
                  onCheckedChange={handleToggleNotification} 
                />
                <Label htmlFor="email-notifications" className="text-sm font-medium cursor-pointer flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                  <Bell size={14} />
                  Email Notifications
                </Label>
              </div>
              <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(true)}>
                <Edit className="size-3 mr-1" />
                Edit
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <div className="flex flex-col h-[calc(100vh-300px)]">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="mb-6 p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
                <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Initial Request
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {ticket.description}
                </p>
              </div>

              {ticket.comments && ticket.comments.length > 0 && (
                <div className="space-y-2">
                  {ticket.comments.map((comment, idx) => (
                    <MessageBubble
                      key={idx}
                      message={comment}
                      isOwn={comment.authorRole === 'admin'}
                      authorColor="#AE613A"
                    />
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {ticket.status !== 'closed' && ticket.status !== 'resolved' ? (
              <ReplyInput ticketId={id} onReplySent={handleReplySent} />
            ) : (
              <div className="border-t p-4 bg-muted/50 text-center">
                <p className="text-sm text-muted-foreground">
                  This ticket is {ticket.status}. No further replies can be added.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <EditTicketDialog 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen} 
        ticket={ticket}
        onSaveSuccess={loadTicket}
      />
    </div>
  );
}

export default TicketDetail;
