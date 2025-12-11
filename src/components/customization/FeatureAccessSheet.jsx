import { useState } from 'react'
import apiService from '@/services/api'
import { toast } from 'sonner'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

function FeatureAccessSheet({ open, onOpenChange, product, pricePKR, priceGBP, featureKey }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    transactionId: '',
    amount: '',
    date: '',
    notes: '',
    screenshot: null,
  })

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleScreenshot = (e) => {
    const file = e.target.files?.[0] || null
    setForm(prev => ({ ...prev, screenshot: file }))
  }

  const handleSubmit = async () => {
    try {
      const formData = new FormData()
      formData.append('featureKey', featureKey)
      formData.append('product', product)
      formData.append('pricePKR', String(pricePKR))
      formData.append('priceGBP', String(priceGBP))
      formData.append('name', form.name)
      formData.append('email', form.email)
      formData.append('transactionId', form.transactionId)
      formData.append('amountPaid', form.amount)
      formData.append('paymentDate', form.date)
      formData.append('notes', form.notes)
      if (form.screenshot) formData.append('screenshot', form.screenshot)

      const res = await apiService.createPaymentRequest(formData)
      if (res.data?.success) {
        toast.success('Payment request submitted for review')
        onOpenChange(false)
      } else {
        toast.error(res.data?.message || 'Failed to submit payment request')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Submission failed')
    }
  }


  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{product} Access</SheetTitle>
          <SheetDescription>Complete payment and submit proof to activate access</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bank Details</CardTitle>
              <CardDescription>Use these details to make payment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-sm font-medium">Account Name</div>
                  <div>ZAIN ALI</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Bank</div>
                  <div>Meezan Bank Limited</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Account Number</div>
                  <div>00300110987096</div>
                </div>
                <div>
                  <div className="text-sm font-medium">IBAN</div>
                  <div>PK93MEZN0000300110987096</div>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Badge variant="secondary">PKR {pricePKR.toLocaleString()}</Badge>
                <Badge variant="secondary">£{priceGBP}</Badge>
                <span className="text-sm">One-time payment • Lifetime access</span>
              </div>
            </CardContent>
          </Card>

          

          <Card>
            <CardHeader>
              <CardTitle>Payment Proof</CardTitle>
              <CardDescription>Enter payment details and upload screenshot</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Your name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="you@example.com" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="transactionId">Transaction ID</Label>
                  <Input id="transactionId" value={form.transactionId} onChange={(e) => handleChange('transactionId', e.target.value)} placeholder="Reference number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount Paid</Label>
                  <Input id="amount" value={form.amount} onChange={(e) => handleChange('amount', e.target.value)} placeholder="e.g., 200000 PKR" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Payment Date</Label>
                <Input id="date" type="date" value={form.date} onChange={(e) => handleChange('date', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" value={form.notes} onChange={(e) => handleChange('notes', e.target.value)} placeholder="Optional notes" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="screenshot">Upload Screenshot</Label>
                <Input id="screenshot" type="file" accept="image/*" onChange={handleScreenshot} />
              </div>
            </CardContent>
          </Card>
        </div>

        <SheetFooter>
          <Button onClick={handleSubmit} className="w-full">Submit</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default FeatureAccessSheet
