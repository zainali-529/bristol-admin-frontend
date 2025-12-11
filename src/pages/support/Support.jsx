import { useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchTickets, setFilters } from '@/store/ticketsSlice'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import TicketFormSheet from '@/components/tickets/TicketFormSheet'
import { LifeBuoy, AlertTriangle, CheckCircle, Clock, Search, Plus } from 'lucide-react'

function SupportPage() {
  const dispatch = useAppDispatch()
  const { list, loading, filters } = useAppSelector((s) => s.tickets)
  const [openSheet, setOpenSheet] = useState(false)

  useEffect(() => {
    dispatch(fetchTickets({ ...filters }))
  }, [dispatch])

  const stats = useMemo(() => {
    const total = list.length
    const open = list.filter(t => t.status === 'open').length
    const inProgress = list.filter(t => t.status === 'in_progress').length
    const critical = list.filter(t => t.priority === 'critical').length
    return { total, open, inProgress, critical }
  }, [list])

  const handleFilterChange = (key, value) => {
    const normalized = value === 'all' ? '' : value
    const next = { ...filters, [key]: normalized }
    dispatch(setFilters(next))
    dispatch(fetchTickets(next))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Support</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage tickets between Admin and Developers</p>
        </div>
        <Button onClick={() => setOpenSheet(true)} style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
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
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Search className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
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
              <Input placeholder="Search tickets" className="pl-9" value={filters.search}
                     onChange={(e) => handleFilterChange('search', e.target.value)} />
            </div>
            <Select value={filters.status || 'all'} onValueChange={(v) => handleFilterChange('status', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
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
            {loading && list.length === 0 ? (
              <div className="col-span-3 text-center py-10">Loading tickets…</div>
            ) : list.length === 0 ? (
              <div className="col-span-3 text-center py-10">No tickets found</div>
            ) : (
              list.map((t) => (
                <Card key={t._id} className="border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{t.title}</span>
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
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{t.status}</Badge>
                        {t.status === 'resolved' && <CheckCircle className="size-4 text-emerald-500" />}
                      </div>
                      <span style={{ color: 'var(--text-secondary)' }}>{new Date(t.createdAt).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <TicketFormSheet open={openSheet} onOpenChange={setOpenSheet} onSaveSuccess={() => dispatch(fetchTickets({ ...filters }))} />
    </div>
  )
}

export default SupportPage
