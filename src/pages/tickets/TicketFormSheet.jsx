import { useEffect } from 'react'
import axios from '@/lib/axios'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters'),
  description: z.string().min(1, 'Description is required').max(3000, 'Description too long'),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  category: z.enum(['bug', 'feature', 'request', 'discussion']),
  status: z.enum(['open', 'in-progress', 'resolved', 'closed', 'awaiting-admin-reply', 'awaiting-developer-reply']).optional(),
})

function TicketFormSheet({ open, onOpenChange, ticketId, onSaveSuccess }) {
  const isEditMode = !!ticketId

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { title: '', description: '', priority: 'medium', category: 'discussion', status: 'open' }
  })

  useEffect(() => { if (!open) reset({ title: '', description: '', priority: 'medium', category: 'discussion' }) }, [open, reset])

  useEffect(() => {
    const loadTicket = async () => {
      if (ticketId && open) {
        const res = await axios.get(`/tickets/${ticketId}`)
        const d = res.data?.data
        if (d) {
          setValue('title', d.title || '')
          setValue('description', d.description || '')
          setValue('priority', d.priority || 'medium')
          setValue('category', d.category || 'discussion')
          setValue('status', d.status || 'open')
        }
      }
    }
    loadTicket()
  }, [ticketId, open, setValue])

  const onSubmit = async (values) => {
    try {
      let res
      if (isEditMode) {
        res = await axios.patch(`/tickets/${ticketId}`, values)
      } else {
        res = await axios.post('/tickets', values)
      }
      if (res.data?.success !== false) {
        onOpenChange(false)
        onSaveSuccess && onSaveSuccess()
      }
    } catch (e) {
      console.error('Error saving ticket:', e)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle style={{ color: 'var(--text-primary)' }}>{isEditMode ? 'Edit Ticket' : 'Create Ticket'}</SheetTitle>
          <SheetDescription style={{ color: 'var(--text-secondary)' }}>
            {isEditMode ? 'Update the ticket details.' : 'Create a new support ticket.'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-y-auto p-4 space-y-6">
          <div className="space-y-4">
            <Label htmlFor="title" style={{ color: 'var(--text-primary)' }}>Title</Label>
            <Input id="title" {...register('title')} />
            {errors.title && <p className="text-destructive text-sm mt-1">{errors.title.message}</p>}
          </div>

          <div className="space-y-4">
            <Label htmlFor="description" style={{ color: 'var(--text-primary)' }}>Description</Label>
            <Textarea id="description" rows={5} {...register('description')} />
            {errors.description && <p className="text-destructive text-sm mt-1">{errors.description.message}</p>}
          </div>

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label style={{ color: 'var(--text-primary)' }}>Priority</Label>
              <Select onValueChange={(v) => setValue('priority', v)} defaultValue="medium">
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              {errors.priority && <p className="text-destructive text-sm mt-1">{errors.priority.message}</p>}
            </div>

            <div className="space-y-2">
              <Label style={{ color: 'var(--text-primary)' }}>Category</Label>
              <Select onValueChange={(v) => setValue('category', v)} defaultValue="discussion">
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="feature">Feature</SelectItem>
                  <SelectItem value="request">Request</SelectItem>
                  <SelectItem value="discussion">Discussion</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && <p className="text-destructive text-sm mt-1">{errors.category.message}</p>}
            </div>
          </div>

          {isEditMode && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label style={{ color: 'var(--text-primary)' }}>Status</Label>
                <Select onValueChange={(v) => setValue('status', v)} defaultValue="open">
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="awaiting-admin-reply">Awaiting Admin</SelectItem>
                    <SelectItem value="awaiting-developer-reply">Awaiting Developer</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && <p className="text-destructive text-sm mt-1">{errors.status.message}</p>}
              </div>
            </div>
          )}

          <SheetFooter>
            <Button type="submit" disabled={isSubmitting} style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
              {isEditMode ? 'Save Changes' : 'Create Ticket'}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

export default TicketFormSheet
