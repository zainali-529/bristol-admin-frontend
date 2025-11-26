import { useState, useEffect, useRef } from 'react'
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
import { updateSingleStep, clearError } from '@/store/howWeWorkSlice'
import { Save, Loader2, Upload, X } from 'lucide-react'
import { toast } from 'sonner'

function StepFormSheet({ open, onOpenChange, step, stepOrder }) {
  const dispatch = useAppDispatch()
  const { loading } = useAppSelector((state) => state.howWeWork)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageAlt: '',
  })
  const [imagePreview, setImagePreview] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [errors, setErrors] = useState({})
  const imageInputRef = useRef(null)

  useEffect(() => {
    if (open && step) {
      setFormData({
        title: step.title || '',
        description: step.description || '',
        imageAlt: step.image?.alt || '',
      })
      setImagePreview(step.image?.url || null)
      setImageFile(null)
      setErrors({})
      dispatch(clearError())
    }
  }, [open, step, dispatch])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: 'Please select a valid image file' }))
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }))
      return
    }

    setImageFile(file)
    setErrors(prev => ({ ...prev, image: '' }))

    // Preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(step?.image?.url || null)
    if (imageInputRef.current) {
      imageInputRef.current.value = ''
    }
  }

  const validateForm = () => {
    const newErrors = {}

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

    if (formData.imageAlt && formData.imageAlt.length > 100) {
      newErrors.imageAlt = 'Image alt text cannot exceed 100 characters'
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
      const stepData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        imageAlt: formData.imageAlt.trim(),
        imageFile: imageFile,
      }

      const result = await dispatch(updateSingleStep({
        order: stepOrder,
        stepData,
      }))

      if (result.type.endsWith('/fulfilled')) {
        toast.success(`Step ${stepOrder} updated successfully`)
        onOpenChange(false)
      } else {
        toast.error(result.payload || 'Failed to update step')
      }
    } catch (error) {
      toast.error('Failed to update step')
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle style={{ color: 'var(--text-primary)' }}>
            Edit Step {stepOrder}
          </SheetTitle>
          <SheetDescription style={{ color: 'var(--text-secondary)' }}>
            Update the image, title, and description for this step
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-y-auto scrollbar-hide p-4 space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image" style={{ color: 'var(--text-primary)' }}>
              Step Image
            </Label>
            {imagePreview ? (
              <div className="space-y-4">
                <div className="relative w-full h-64 rounded-lg border-2 border-dashed overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                    style={{ borderColor: '#ef4444', color: '#ef4444' }}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => imageInputRef.current?.click()}
                  style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                >
                  <Upload className="mr-2 size-4" /> Change Image
                </Button>
              </div>
            ) : (
              <div
                className="w-full h-64 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                style={{ borderColor: 'var(--border)' }}
                onClick={() => imageInputRef.current?.click()}
              >
                <Upload className="size-12 mb-4" style={{ color: 'var(--text-secondary)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Click to upload image
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  PNG, JPG, WEBP up to 5MB
                </p>
              </div>
            )}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              onChange={handleImageChange}
            />
            {errors.image && <p className="text-destructive text-sm">{errors.image}</p>}
          </div>

          <Separator />

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" style={{ color: 'var(--text-primary)' }}>
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Just Getting Started?"
              style={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
            <div className="flex justify-between text-xs">
              {errors.title && <p className="text-destructive">{errors.title}</p>}
              <p className="ml-auto" style={{ color: 'var(--text-secondary)' }}>
                {formData.title.length} / 100 characters
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" style={{ color: 'var(--text-primary)' }}>
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              placeholder="Provide a detailed description..."
              style={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
            <div className="flex justify-between text-xs">
              {errors.description && <p className="text-destructive">{errors.description}</p>}
              <p className="ml-auto" style={{ color: 'var(--text-secondary)' }}>
                {formData.description.length} / 300 characters
              </p>
            </div>
          </div>

          {/* Image Alt Text */}
          <div className="space-y-2">
            <Label htmlFor="imageAlt" style={{ color: 'var(--text-primary)' }}>
              Image Alt Text
            </Label>
            <Input
              id="imageAlt"
              value={formData.imageAlt}
              onChange={(e) => handleInputChange('imageAlt', e.target.value)}
              placeholder="Describe the image for accessibility"
              style={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
            <div className="flex justify-between text-xs">
              {errors.imageAlt && <p className="text-destructive">{errors.imageAlt}</p>}
              <p className="ml-auto" style={{ color: 'var(--text-secondary)' }}>
                {formData.imageAlt.length} / 100 characters
              </p>
            </div>
          </div>

          <SheetFooter className="flex-col gap-2 p-4 border-t mt-auto">
            <Button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 size-4" /> Save Changes
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              style={{
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
                backgroundColor: 'transparent',
              }}
            >
              Cancel
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

export default StepFormSheet

