import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchTrustCards,
  updateTrustCards,
  updateTrustStatus,
  clearError,
} from '@/store/whyTrustUsSlice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import TrustCardForm from '@/components/whyTrustUs/TrustCardForm'
import { Edit, Eye, EyeOff, Save, Loader2, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'

function WhyTrustUsPage() {
  const dispatch = useAppDispatch()
  const { cards, isActive, loading, error, lastUpdated } = useAppSelector(
    (state) => state.whyTrustUs
  )
  const [selectedCard, setSelectedCard] = useState(null)
  const [selectedCardOrder, setSelectedCardOrder] = useState(null)
  const [formOpen, setFormOpen] = useState(false)

  useEffect(() => {
    dispatch(fetchTrustCards())
  }, [dispatch])

  const handleEditCard = (card, order) => {
    setSelectedCard(card)
    setSelectedCardOrder(order)
    setFormOpen(true)
  }

  const handleToggleStatus = async () => {
    const result = await dispatch(updateTrustStatus(!isActive))
    if (result.type.endsWith('/fulfilled')) {
      toast.success(`Why Trust Us section ${!isActive ? 'activated' : 'deactivated'} successfully`)
    } else {
      toast.error(result.payload || 'Failed to update status')
    }
  }

  const handleRefresh = () => {
    dispatch(fetchTrustCards())
  }

  const handleFormSuccess = () => {
    // The form will automatically update the Redux state
    // No need to refetch as the updateSingleCard action handles it
  }

  const renderTrustCard = (card, index) => {
    const IconComponent = LucideIcons[card.icon]
    const order = index + 1

    return (
      <div key={card.order || index} className="relative">
        {/* Card Preview - Matching User Frontend Design */}
        <div 
          className={`relative p-6 md:p-8 flex flex-col items-start h-80 md:h-96 ${
            index === 0 ? 'md:rounded-l-3xl' : 
            index === 2 ? 'md:rounded-r-3xl' : ''
          }`}
          style={{ 
            backgroundColor: index === 1 ? 'var(--primary-10)' : 'var(--primary-5)',
          }}
        >
          {/* Edit Button */}
          <Button
            size="icon"
            variant="outline"
            className="absolute top-4 right-4 h-8 w-8 bg-background/80 backdrop-blur-sm"
            onClick={() => handleEditCard(card, order)}
          >
            <Edit className="h-4 w-4" />
          </Button>

          {/* Icon Circle - Matching User Frontend */}
          <div 
            className={`w-16 h-16 md:w-20 md:h-20 rounded-full ${
              index === 1 ? 'mb-auto' : 'mb-6'
            } flex items-center justify-center`}
            style={{ 
              background: 'linear-gradient(to bottom, var(--primary-100), var(--primary-60))',
            }}
          >
            {IconComponent ? (
              <IconComponent size={32} className="text-white" strokeWidth={2} />
            ) : (
              <div className="text-white text-xs">?</div>
            )}
          </div>

          {/* Content */}
          <div className={`flex-1 flex flex-col justify-center ${index === 1 ? 'order-first mb-8' : ''}`}>
            <h3 
              className="text-xl md:text-2xl font-bold mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              {card.title}
            </h3>
            <p 
              className="text-sm md:text-base leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              {card.description}
            </p>
          </div>

          {/* Order Badge */}
          <Badge 
            variant="secondary" 
            className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm"
          >
            Card {order}
          </Badge>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Why Trust Us</h1>
          <p className="text-muted-foreground">
            Manage the three trust cards displayed on your homepage
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Section Status
                <Badge variant={isActive ? 'default' : 'secondary'}>
                  {isActive ? 'Active' : 'Inactive'}
                </Badge>
              </CardTitle>
              <CardDescription>
                Control whether the Why Trust Us section appears on your homepage
                {lastUpdated && (
                  <span className="block mt-1">
                    Last updated: {format(new Date(lastUpdated), 'PPpp')}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {isActive ? (
                <Eye className="h-4 w-4 text-green-600" />
              ) : (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              )}
              <Switch
                checked={isActive}
                onCheckedChange={handleToggleStatus}
                disabled={loading}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <div className="text-sm">{error}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trust Cards Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Trust Cards</CardTitle>
          <CardDescription>
            Preview and edit your trust cards. Click the edit button on any card to modify it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && !cards.length ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Cards Preview - Matching User Frontend Layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 max-w-6xl mx-auto border rounded-3xl overflow-hidden">
                {cards.map((card, index) => renderTrustCard(card, index))}
              </div>

              {/* Instructions */}
              <div className="text-center text-sm text-muted-foreground bg-muted/30 rounded-lg p-4">
                <p className="mb-2">
                  <strong>How it works:</strong> These three cards appear in the "Why Trust Us" section of your homepage.
                </p>
                <p>
                  Click the edit button on any card to modify its icon, title, and description. 
                  Icons use Lucide icons - visit{' '}
                  <a 
                    href="https://lucide.dev/icons" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    lucide.dev
                  </a>
                  {' '}to browse available icons.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trust Card Form Sheet */}
      <TrustCardForm
        open={formOpen}
        onOpenChange={setFormOpen}
        card={selectedCard}
        cardOrder={selectedCardOrder}
        onSuccess={handleFormSuccess}
      />
    </div>
  )
}

export default WhyTrustUsPage
