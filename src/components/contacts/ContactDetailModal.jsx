import { useEffect, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import StatusBadge from '@/components/shared/StatusBadge'
import { Mail, Phone, Calendar, FileText, Save, Loader2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchContactById, updateContact, clearError } from '@/store/contactsSlice'
import { format } from 'date-fns'
import { toast } from 'sonner'

function ContactDetailSheet({ contactId, open, onOpenChange }) {
  const dispatch = useAppDispatch()
  const { selectedContact, loading } = useAppSelector((state) => state.contacts)
  const [status, setStatus] = useState('new')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (open && contactId) {
      dispatch(fetchContactById(contactId))
    }
  }, [open, contactId, dispatch])

  useEffect(() => {
    if (selectedContact) {
      setStatus(selectedContact.status || 'new')
      setNotes(selectedContact.notes || '')
    }
  }, [selectedContact])

  const handleSave = async () => {
    if (!selectedContact) return

    dispatch(clearError())
    const result = await dispatch(updateContact({
      id: selectedContact._id,
      data: { status, notes },
    }))
    
    if (result.type.endsWith('/fulfilled')) {
      toast.success('Contact updated successfully')
      onOpenChange(false)
    } else {
      toast.error(result.payload || 'Failed to update contact')
    }
  }

  if (!selectedContact) return null

  const contact = selectedContact

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            Contact Details
            <StatusBadge status={contact.status} />
          </SheetTitle>
          <SheetDescription>
            View and manage contact information
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="p-4 space-y-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Name</Label>
                <p className="text-sm font-medium">{contact.name}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-2">
                  <Mail className="size-3" />
                  Email
                </Label>
                <a
                  href={`mailto:${contact.email}`}
                  className="text-sm text-primary hover:underline"
                >
                  {contact.email}
                </a>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-2">
                  <Phone className="size-3" />
                  Phone
                </Label>
                <a
                  href={`tel:${contact.phone}`}
                  className="text-sm text-primary hover:underline"
                >
                  {contact.phone}
                </a>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Service</Label>
                <p className="text-sm font-medium">{contact.service}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Message */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground flex items-center gap-2">
              <FileText className="size-3" />
              Message
            </Label>
            <div className="p-4 rounded-md bg-muted text-sm">
              {contact.message}
            </div>
          </div>

          <Separator />

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-2">
                <Calendar className="size-3" />
                Created At
              </Label>
              <p className="text-sm">
                {format(new Date(contact.createdAt), 'PPpp')}
              </p>
            </div>
            {contact.updatedAt && contact.updatedAt !== contact.createdAt && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-2">
                  <Calendar className="size-3" />
                  Updated At
                </Label>
                <p className="text-sm">
                  {format(new Date(contact.updatedAt), 'PPpp')}
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Status and Notes */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Management</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add notes about this contact..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          </div>

          </div>
        </div>

        <SheetFooter className="px-4 py-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 size-4" />
                Save Changes
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default ContactDetailSheet

