import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LifeBuoy, AlertTriangle, CheckCircle, Clock, Search, Plus } from 'lucide-react';
import TicketFormSheet from './TicketFormSheet';
import StatusBadge from '@/components/tickets/StatusBadge';

function TicketsPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });
  const [openSheet, setOpenSheet] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const loadTickets = async (params = {}) => {
    setLoading(true);
    try {
      const res = await axios.get('/tickets', { params });
      setTickets(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load tickets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets({ ...filters });
  }, []);

  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'open').length;
    const awaitingReply = tickets.filter(t => t.status === 'awaiting-admin-reply').length;
    const critical = tickets.filter(t => t.priority === 'critical').length;
    return { total, open, awaitingReply, critical };
  }, [tickets]);

  const handleFilterChange = (key, value) => {
    const normalized = value === 'all' ? '' : value;
    const next = { ...filters, [key]: normalized };
    setFilters(next);
    loadTickets(next);
  };

  const handleTicketClick = (ticketId) => {
    navigate(`/tickets/${ticketId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Tickets</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage and collaborate on support tickets</p>
        </div>
        <Button onClick={() => { setSelectedId(null); setOpenSheet(true) }} style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
          <Plus className="mr-2 size-4" /> Create Ticket
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <LifeBuoy className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
            <Clock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.open}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Awaiting Reply</CardTitle>
            <Search className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.awaitingReply}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertTriangle className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.critical}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search tickets" className="pl-9" value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} />
            </div>
            <Select value={filters.status || 'all'} onValueChange={(v) => handleFilterChange('status', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="awaiting-admin-reply">Awaiting Admin</SelectItem>
                <SelectItem value="awaiting-developer-reply">Awaiting Developer</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.priority || 'all'} onValueChange={(v) => handleFilterChange('priority', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {loading && tickets.length === 0 ? (
              <div className="col-span-3 text-center py-10">Loading tickets…</div>
            ) : tickets.length === 0 ? (
              <div className="col-span-3 text-center py-10">No tickets found</div>
            ) : (
              tickets.map((t) => (
                <Card 
                  key={t._id} 
                  className="border cursor-pointer hover:shadow-md transition-shadow relative" 
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
                  onClick={() => handleTicketClick(t._id)}
                >
                  {t.unreadByAdmin > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs">
                      {t.unreadByAdmin}
                    </Badge>
                  )}
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-base">{t.title}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{t.category || 'support'}</Badge>
                        <Badge className={
                          t.priority === 'critical' ? 'bg-destructive text-destructive-foreground' :
                          t.priority === 'high' ? 'bg-primary text-primary-foreground' :
                          'bg-muted text-muted-foreground'
                        }>{t.priority}</Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{t.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <StatusBadge status={t.status} userRole="admin" />
                      <span style={{ color: 'var(--text-secondary)' }}>{new Date(t.createdAt).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <TicketFormSheet open={openSheet} onOpenChange={(open) => { if (!open) setSelectedId(null); setOpenSheet(open) }} ticketId={selectedId} onSaveSuccess={() => loadTickets({ ...filters })} />
    </div>
  );
}

export default TicketsPage;
