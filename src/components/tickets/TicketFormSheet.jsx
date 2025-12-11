import { useEffect } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { createTicket, updateTicket, fetchTicketById } from '@/store/ticketsSlice'
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
import { toast } from 'sonner'

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters'),
  description: z.string().min(1, 'Description is required').max(3000, 'Description too long'),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  category: z.enum(['bug', 'feature', 'improvement', 'support']),
})

function TicketFormSheet({ open, onOpenChange, ticketId, onSaveSuccess }) {
  const dispatch = useAppDispatch()
  const isEditMode = !!ticketId

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      category: 'support',
    }
  })

  useEffect(() => {
    if (!open) {
      reset({ title: '', description: '', priority: 'medium', category: 'support' })
    }
  }, [open, reset])

  useEffect(() => {
    if (ticketId && open) {
      dispatch(fetchTicketById(ticketId)).then((res) => {
        const data = res?.payload?.data
        if (data) {
          setValue('title', data.title || '')
          setValue('description', data.description || '')
          setValue('priority', data.priority || 'medium')
          setValue('category', data.category || 'support')
        }
      })
    }
  }, [ticketId, open, dispatch, setValue])

  const onSubmit = async (values) => {
    try {
      let result
      if (isEditMode) {
        result = await dispatch(updateTicket({ id: ticketId, data: values }))
      } else {
        result = await dispatch(createTicket(values))
      }
      if (result.type.endsWith('/fulfilled')) {
        toast.success(`Ticket ${isEditMode ? 'updated' : 'created'} successfully`)
        onOpenChange(false)
        onSaveSuccess && onSaveSuccess()
      } else {
        toast.error(result.payload || 'Failed to save ticket')
      }
    } catch (e) {
      toast.error('Failed to save ticket')
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

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-y-auto scrollbar-hide p-4 space-y-6">
          <div className="space-y-4">
            <Label htmlFor="title" style={{ color: 'var(--text-primary)' }}>Title</Label>
            <Input id="title" {...register('title')} style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
            {errors.title && <p className="text-destructive text-sm mt-1">{errors.title.message}</p>}
          </div>

          <div className="space-y-4">
            <Label htmlFor="description" style={{ color: 'var(--text-primary)' }}>Description</Label>
            <Textarea id="description" rows={5} {...register('description')} style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
            {errors.description && <p className="text-destructive text-sm mt-1">{errors.description.message}</p>}
          </div>

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label style={{ color: 'var(--text-primary)' }}>Priority</Label>
              <Select onValueChange={(v) => setValue('priority', v)} defaultValue="medium">
                <SelectTrigger style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
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
              <Select onValueChange={(v) => setValue('category', v)} defaultValue="support">
                <SelectTrigger style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="feature">Feature</SelectItem>
                  <SelectItem value="improvement">Improvement</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && <p className="text-destructive text-sm mt-1">{errors.category.message}</p>}
            </div>
          </div>

          <SheetFooter>
            <Button type="submit" disabled={isSubmitting} style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
              {isEditMode ? 'Save Changes' : 'Create Ticket'}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting} style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', backgroundColor: 'transparent' }}>
              Cancel
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

export default TicketFormSheet

