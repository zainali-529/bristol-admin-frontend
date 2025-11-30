import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchHowWeWork,
  updateHowWeWorkStatus,
  clearError,
} from '@/store/howWeWorkSlice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import StepFormSheet from '@/components/howWeWork/StepFormSheet'
import { Edit, Eye, EyeOff, Loader2, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

function HowWeWorkPage() {
  const dispatch = useAppDispatch()
  const { steps, isActive, loading, error, lastUpdated } = useAppSelector(
    (state) => state.howWeWork
  )
  const [selectedStep, setSelectedStep] = useState(null)
  const [selectedStepOrder, setSelectedStepOrder] = useState(null)
  const [formOpen, setFormOpen] = useState(false)

  useEffect(() => {
    dispatch(fetchHowWeWork())
  }, [dispatch])

  const handleEditStep = (step, order) => {
    setSelectedStep(step)
    setSelectedStepOrder(order)
    setFormOpen(true)
  }

  const handleToggleStatus = async () => {
    const result = await dispatch(updateHowWeWorkStatus(!isActive))
    if (result.type.endsWith('/fulfilled')) {
      toast.success(`How We Work section ${!isActive ? 'activated' : 'deactivated'} successfully`)
    } else {
      toast.error(result.payload || 'Failed to update status')
    }
  }

  const handleRefresh = () => {
    dispatch(fetchHowWeWork())
  }

  const renderStepCard = (step, index) => {
    const order = index + 1

    return (
      <div key={step.order || index} className="relative">
        {/* Step Preview Card */}
        <Card
          className="h-full"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                  Step {order}
                </Badge>
                {!isActive && (
                  <Badge variant="secondary" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                    Inactive
                  </Badge>
                )}
              </div>
              <Button
                size="icon"
                variant="outline"
                onClick={() => handleEditStep(step, order)}
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Image */}
            <div className="relative w-full h-48 rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--muted)' }}>
              {step.image?.url ? (
                <img
                  src={step.image.url}
                  alt={step.image.alt || `Step ${order}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No image</p>
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                {step.title || 'Untitled Step'}
              </h3>
              <p className="text-sm line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
                {step.description || 'No description provided'}
              </p>
            </div>

            {/* Order Info */}
            <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Display Order: {step.order || order}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            How We Work
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Manage the four-step process displayed on your homepage
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={loading}
            style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div
          className="p-4 rounded-md border"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: '#ef4444',
            color: '#ef4444',
          }}
        >
          {error}
        </div>
      )}

      {/* Status Toggle */}
      <Card style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <CardHeader>
          <CardTitle style={{ color: 'var(--text-primary)' }}>Section Status</CardTitle>
          <CardDescription style={{ color: 'var(--text-secondary)' }}>
            Control whether the "How We Work" section is visible on your website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                {isActive ? (
                  <Eye className="h-5 w-5" style={{ color: '#10b981' }} />
                ) : (
                  <EyeOff className="h-5 w-5" style={{ color: '#ef4444' }} />
                )}
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {isActive
                  ? 'The "How We Work" section is currently visible on your website'
                  : 'The "How We Work" section is hidden from your website'}
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={handleToggleStatus} disabled={loading} />
          </div>
          {lastUpdated && (
            <p className="text-xs mt-4" style={{ color: 'var(--text-secondary)' }}>
              Last updated: {format(new Date(lastUpdated), 'PPpp')}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Steps Preview */}
      <Card style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <CardHeader>
          <CardTitle style={{ color: 'var(--text-primary)' }}>Work Steps Preview</CardTitle>
          <CardDescription style={{ color: 'var(--text-secondary)' }}>
            This is how your "How We Work" section appears on your website. Click edit on any step to modify it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && steps.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                <p style={{ color: 'var(--text-secondary)' }}>Loading steps...</p>
              </div>
            </div>
          ) : steps.length === 0 ? (
            <div className="text-center py-12">
              <p style={{ color: 'var(--text-secondary)' }}>No steps found. Please refresh the page.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...steps]
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((step, index) => renderStepCard(step, index))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step Form Sheet */}
      <StepFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        step={selectedStep}
        stepOrder={selectedStepOrder}
      />
    </div>
  )
}

export default HowWeWorkPage

