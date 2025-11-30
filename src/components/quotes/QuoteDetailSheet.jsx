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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import StatusBadge from '@/components/shared/StatusBadge'
import { 
  Mail, 
  Phone, 
  Calendar, 
  FileText, 
  Save, 
  Loader2, 
  Building2, 
  MapPin,
  Zap,
  TrendingDown,
  Leaf,
  DollarSign
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchQuoteById, updateQuote, clearError } from '@/store/quotesSlice'
import { format } from 'date-fns'
import { toast } from 'sonner'

function QuoteDetailSheet({ quoteId, open, onOpenChange }) {
  const dispatch = useAppDispatch()
  const { selectedQuote, loading } = useAppSelector((state) => state.quotes)
  const [status, setStatus] = useState('new')
  const [quoteValue, setQuoteValue] = useState('')
  const [quoteCurrency, setQuoteCurrency] = useState('GBP')
  const [adminNotes, setAdminNotes] = useState('')

  useEffect(() => {
    if (open && quoteId) {
      dispatch(fetchQuoteById(quoteId))
    }
  }, [open, quoteId, dispatch])

  useEffect(() => {
    if (selectedQuote) {
      setStatus(selectedQuote.status || 'new')
      setQuoteValue(selectedQuote.quoteValue ? selectedQuote.quoteValue.toString() : '')
      setQuoteCurrency(selectedQuote.quoteCurrency || 'GBP')
      setAdminNotes(selectedQuote.adminNotes || '')
    }
  }, [selectedQuote])

  const handleSave = async () => {
    if (!selectedQuote) return

    dispatch(clearError())
    const updateData = {}
    
    if (status !== selectedQuote.status) {
      updateData.status = status
    }
    if (quoteValue !== (selectedQuote.quoteValue ? selectedQuote.quoteValue.toString() : '')) {
      updateData.quoteValue = quoteValue ? parseFloat(quoteValue) : null
    }
    if (quoteCurrency !== (selectedQuote.quoteCurrency || 'GBP')) {
      updateData.quoteCurrency = quoteCurrency
    }
    if (adminNotes !== (selectedQuote.adminNotes || '')) {
      updateData.adminNotes = adminNotes
    }

    if (Object.keys(updateData).length === 0) {
      toast.info('No changes to save')
      return
    }

    const result = await dispatch(updateQuote({
      id: selectedQuote._id,
      data: updateData,
    }))
    
    if (result.type.endsWith('/fulfilled')) {
      toast.success('Quote updated successfully')
      onOpenChange(false)
    } else {
      toast.error(result.payload || 'Failed to update quote')
    }
  }

  if (!selectedQuote) return null

  const quote = selectedQuote

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            Quote Request Details
            <StatusBadge status={quote.status} />
          </SheetTitle>
          <SheetDescription>
            View and manage quote request information
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
            <div className="p-4 space-y-6">
              {/* Business Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Building2 className="size-4" />
                  Business Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Business Name</Label>
                    <p className="text-sm font-medium">{quote.businessName}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Business Type</Label>
                    <p className="text-sm font-medium">{quote.businessType}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground flex items-center gap-2">
                      <MapPin className="size-3" />
                      Postcode
                    </Label>
                    <p className="text-sm font-medium">{quote.postcode}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Number of Sites</Label>
                    <p className="text-sm font-medium">{quote.numberOfSites}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Energy Usage */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Zap className="size-4" />
                  Energy Usage
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Annual Electricity Usage</Label>
                    <p className="text-sm font-medium">{quote.electricityUsage} kWh/year</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Current Monthly Elec. Cost</Label>
                    <p className="text-sm font-medium">
                      {quote.currentElectricityCost ? `£${quote.currentElectricityCost}` : 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Annual Gas Usage</Label>
                    <p className="text-sm font-medium">{quote.gasUsage} kWh/year</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Current Monthly Gas Cost</Label>
                    <p className="text-sm font-medium">
                      {quote.currentGasCost ? `£${quote.currentGasCost}` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Current Supplier */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <TrendingDown className="size-4" />
                  Current Supplier & Preferences
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Electricity Supplier</Label>
                    <p className="text-sm font-medium">{quote.currentElectricitySupplier || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Gas Supplier</Label>
                    <p className="text-sm font-medium">{quote.currentGasSupplier || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground flex items-center gap-2">
                      <Calendar className="size-3" />
                      Contract End Date
                    </Label>
                    <p className="text-sm font-medium">
                      {quote.contractEndDate ? format(new Date(quote.contractEndDate), 'PP') : 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground flex items-center gap-2">
                      <Leaf className="size-3" />
                      Green Energy Preference
                    </Label>
                    <p className="text-sm font-medium">
                      {quote.greenEnergyPreference === 'yes' 
                        ? 'Yes, prefer renewable energy' 
                        : quote.greenEnergyPreference === 'consider'
                        ? 'Consider if cost-effective'
                        : 'No preference'}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Contact Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Contact Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Contact Name</Label>
                    <p className="text-sm font-medium">{quote.contactName}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground flex items-center gap-2">
                      <Mail className="size-3" />
                      Email
                    </Label>
                    <a
                      href={`mailto:${quote.email}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {quote.email}
                    </a>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground flex items-center gap-2">
                      <Phone className="size-3" />
                      Phone
                    </Label>
                    <a
                      href={`tel:${quote.phone}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {quote.phone}
                    </a>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Preferred Contact Method</Label>
                    <p className="text-sm font-medium capitalize">{quote.preferredContactMethod}</p>
                  </div>
                </div>
              </div>

              {quote.additionalNotes && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground flex items-center gap-2">
                      <FileText className="size-3" />
                      Additional Notes
                    </Label>
                    <div className="p-4 rounded-md bg-muted text-sm">
                      {quote.additionalNotes}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Timestamps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground flex items-center gap-2">
                    <Calendar className="size-3" />
                    Created At
                  </Label>
                  <p className="text-sm">
                    {format(new Date(quote.createdAt), 'PPpp')}
                  </p>
                </div>
                {quote.updatedAt && quote.updatedAt !== quote.createdAt && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground flex items-center gap-2">
                      <Calendar className="size-3" />
                      Updated At
                    </Label>
                    <p className="text-sm">
                      {format(new Date(quote.updatedAt), 'PPpp')}
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Management Section */}
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
                        <SelectItem value="reviewing">Reviewing</SelectItem>
                        <SelectItem value="quoted">Quoted</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quoteValue" className="flex items-center gap-2">
                        <DollarSign className="size-3" />
                        Quote Value
                      </Label>
                      <Input
                        id="quoteValue"
                        type="number"
                        placeholder="Enter quote value"
                        value={quoteValue}
                        onChange={(e) => setQuoteValue(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quoteCurrency">Currency</Label>
                      <Select value={quoteCurrency} onValueChange={setQuoteCurrency}>
                        <SelectTrigger id="quoteCurrency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminNotes">Admin Notes</Label>
                    <Textarea
                      id="adminNotes"
                      placeholder="Add notes about this quote request..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <SheetFooter className="px-4 py-4 border-t flex-shrink-0">
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
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default QuoteDetailSheet

