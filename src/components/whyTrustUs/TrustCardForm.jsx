import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { updateSingleCard, clearError } from '@/store/whyTrustUsSlice'
import { Save, Loader2, Lightbulb } from 'lucide-react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'

// Popular icons for trust cards
const POPULAR_ICONS = [
  'Zap', 'ShieldCheck', 'Award', 'Clock', 'DollarSign', 'Star',
  'CheckCircle', 'Heart', 'Lightbulb', 'Target', 'TrendingUp', 'Users',
  'Lock', 'Verified', 'BadgeCheck', 'Crown', 'Gem', 'Rocket'
]

function TrustCardForm({ open, onOpenChange, card, cardOrder }) {
  const dispatch = useAppDispatch()
  const { loading } = useAppSelector((state) => state.whyTrustUs)

  const [formData, setFormData] = useState({
    icon: '',
    title: '',
    description: '',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open && card) {
      setFormData({
        icon: card.icon || '',
        title: card.title || '',
        description: card.description || '',
      })
      setErrors({})
      dispatch(clearError())
    }
  }, [open, card, dispatch])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.icon.trim()) {
      newErrors.icon = 'Icon is required'
    } else if (formData.icon.length > 50) {
      newErrors.icon = 'Icon name cannot exceed 50 characters'
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title cannot exceed 100 characters'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.length > 300) {
      newErrors.description = 'Description cannot exceed 300 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      const result = await dispatch(updateSingleCard({
        order: cardOrder,
        cardData: {
          icon: formData.icon.trim(),
          title: formData.title.trim(),
          description: formData.description.trim(),
        }
      }))

      if (result.type.endsWith('/fulfilled')) {
        toast.success(`Card ${cardOrder} updated successfully`)
        onOpenChange(false)
      } else {
        toast.error(result.payload || 'Failed to update card')
      }
    } catch (error) {
      toast.error('Failed to update card')
    }
  }

  const handleIconSelect = (iconName) => {
    handleInputChange('icon', iconName)
  }

  const renderIconPreview = () => {
    if (!formData.icon) return null
    
    const IconComponent = LucideIcons[formData.icon]
    if (!IconComponent) return null

    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
          <IconComponent size={20} className="text-white" />
        </div>
        <div>
          <p className="font-medium text-sm">Preview</p>
          <p className="text-xs text-muted-foreground">{formData.icon}</p>
        </div>
      </div>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>
            Edit Trust Card {cardOrder}
          </SheetTitle>
          <SheetDescription>
            Update the icon, title, and description for this trust card
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <form onSubmit={handleSubmit} className="space-y-6 p-4">
            {/* Icon Selection */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Icon</h3>
              
              <div className="space-y-2">
                <Label htmlFor="icon">Icon Name *</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => handleInputChange('icon', e.target.value)}
                  placeholder="e.g., Zap, ShieldCheck, Award"
                  className={errors.icon ? 'border-destructive' : ''}
                />
                {errors.icon && (
                  <p className="text-sm text-destructive">{errors.icon}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Enter a Lucide icon name. Check{' '}
                  <a 
                    href="https://lucide.dev/icons" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    lucide.dev
                  </a>
                  {' '}for available icons.
                </p>
              </div>

              {/* Icon Preview */}
              {renderIconPreview()}

              {/* Popular Icons */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Lightbulb size={16} />
                  Popular Icons
                </Label>
                <div className="grid grid-cols-6 gap-2">
                  {POPULAR_ICONS.map((iconName) => {
                    const IconComponent = LucideIcons[iconName]
                    if (!IconComponent) return null

                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => handleIconSelect(iconName)}
                        className={`p-3 rounded-lg border hover:bg-muted transition-colors ${
                          formData.icon === iconName ? 'border-primary bg-primary/5' : ''
                        }`}
                        title={iconName}
                      >
                        <IconComponent size={20} />
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <Separator />

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter card title"
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {formData.title.length}/100 characters
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter card description"
                rows={4}
                className={errors.description ? 'border-destructive' : ''}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/300 characters
              </p>
            </div>
          </form>
        </div>

        <SheetFooter className="px-4 py-4 border-t">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} onClick={handleSubmit}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default TrustCardForm
