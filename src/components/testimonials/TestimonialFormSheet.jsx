import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { createTestimonial, updateTestimonial, fetchTestimonialById, clearSelectedTestimonial } from '@/store/testimonialsSlice'
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
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Loader2, Save, Star } from 'lucide-react'
import { toast } from 'sonner'

function TestimonialFormSheet({ open, onOpenChange, testimonialId, onSaveSuccess }) {
  const dispatch = useAppDispatch()
  const { selectedTestimonial, loading, error } = useAppSelector((state) => state.testimonials)
  const isEditMode = !!testimonialId
  
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    company: '',
    testimonial: '',
    rating: 5,
    displayOrder: 0,
    isActive: true,
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open) {
      if (isEditMode && testimonialId) {
        dispatch(fetchTestimonialById(testimonialId))
      } else {
        resetForm()
        dispatch(clearSelectedTestimonial())
      }
    } else {
      dispatch(clearSelectedTestimonial())
    }
  }, [dispatch, open, isEditMode, testimonialId])

  useEffect(() => {
    if (isEditMode && selectedTestimonial) {
      setFormData({
        name: selectedTestimonial.name || '',
        position: selectedTestimonial.position || '',
        company: selectedTestimonial.company || '',
        testimonial: selectedTestimonial.testimonial || '',
        rating: selectedTestimonial.rating || 5,
        displayOrder: selectedTestimonial.displayOrder || 0,
        isActive: selectedTestimonial.isActive ?? true,
      })
    }
  }, [isEditMode, selectedTestimonial])

  const resetForm = () => {
    setFormData({
      name: '',
      position: '',
      company: '',
      testimonial: '',
      rating: 5,
      displayOrder: 0,
      isActive: true,
    })
    setErrors({})
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name cannot exceed 100 characters'
    }

    if (!formData.position.trim()) {
      newErrors.position = 'Position is required'
    } else if (formData.position.length > 100) {
      newErrors.position = 'Position cannot exceed 100 characters'
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company is required'
    } else if (formData.company.length > 100) {
      newErrors.company = 'Company cannot exceed 100 characters'
    }

    if (!formData.testimonial.trim()) {
      newErrors.testimonial = 'Testimonial text is required'
    } else if (formData.testimonial.length > 1000) {
      newErrors.testimonial = 'Testimonial cannot exceed 1000 characters'
    }

    if (formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = 'Rating must be between 1 and 5'
    }

    if (formData.displayOrder < 0) {
      newErrors.displayOrder = 'Display order must be non-negative'
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
      const submitData = {
        name: formData.name.trim(),
        position: formData.position.trim(),
        company: formData.company.trim(),
        testimonial: formData.testimonial.trim(),
        rating: parseInt(formData.rating),
        displayOrder: parseInt(formData.displayOrder) || 0,
        isActive: formData.isActive,
      }

      let result
      if (isEditMode) {
        result = await dispatch(updateTestimonial({ id: testimonialId, testimonialData: submitData }))
      } else {
        result = await dispatch(createTestimonial(submitData))
      }

      if (result.type.endsWith('/fulfilled')) {
        toast.success(`Testimonial ${isEditMode ? 'updated' : 'created'} successfully`)
        onSaveSuccess?.()
        onOpenChange(false)
        resetForm()
      } else {
        toast.error(result.payload || `Failed to ${isEditMode ? 'update' : 'create'} testimonial`)
      }
    } catch (error) {
      toast.error(`An unexpected error occurred: ${error.message}`)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-2xl overflow-y-auto p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <SheetTitle style={{ color: 'var(--text-primary)' }}>
            {isEditMode ? 'Edit Testimonial' : 'Create New Testimonial'}
          </SheetTitle>
          <SheetDescription style={{ color: 'var(--text-secondary)' }}>
            {isEditMode ? 'Update testimonial information' : 'Add a new testimonial to your website'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-y-auto px-6 py-6 space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" style={{ color: 'var(--text-primary)' }}>
              Client Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Sarah Johnson"
              style={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
            <div className="flex justify-between text-xs">
              {errors.name && <p className="text-destructive">{errors.name}</p>}
              <p className="ml-auto" style={{ color: 'var(--text-secondary)' }}>
                {formData.name.length} / 100 characters
              </p>
            </div>
          </div>

          {/* Position */}
          <div className="space-y-2">
            <Label htmlFor="position" style={{ color: 'var(--text-primary)' }}>
              Position <span className="text-destructive">*</span>
            </Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => handleInputChange('position', e.target.value)}
              placeholder="e.g., CEO"
              style={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
            <div className="flex justify-between text-xs">
              {errors.position && <p className="text-destructive">{errors.position}</p>}
              <p className="ml-auto" style={{ color: 'var(--text-secondary)' }}>
                {formData.position.length} / 100 characters
              </p>
            </div>
          </div>

          {/* Company */}
          <div className="space-y-2">
            <Label htmlFor="company" style={{ color: 'var(--text-primary)' }}>
              Company <span className="text-destructive">*</span>
            </Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              placeholder="e.g., TechCorp Industries"
              style={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
            <div className="flex justify-between text-xs">
              {errors.company && <p className="text-destructive">{errors.company}</p>}
              <p className="ml-auto" style={{ color: 'var(--text-secondary)' }}>
                {formData.company.length} / 100 characters
              </p>
            </div>
          </div>

          <Separator />

          {/* Testimonial Text */}
          <div className="space-y-2">
            <Label htmlFor="testimonial" style={{ color: 'var(--text-primary)' }}>
              Testimonial <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="testimonial"
              value={formData.testimonial}
              onChange={(e) => handleInputChange('testimonial', e.target.value)}
              rows={6}
              placeholder="Enter the testimonial text..."
              style={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
            <div className="flex justify-between text-xs">
              {errors.testimonial && <p className="text-destructive">{errors.testimonial}</p>}
              <p className="ml-auto" style={{ color: 'var(--text-secondary)' }}>
                {formData.testimonial.length} / 1000 characters
              </p>
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label htmlFor="rating" style={{ color: 'var(--text-primary)' }}>
              Rating <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleInputChange('rating', star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`size-6 transition-colors ${
                        star <= formData.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span style={{ color: 'var(--text-secondary)' }}>
                {formData.rating} / 5
              </span>
            </div>
            {errors.rating && <p className="text-destructive text-sm">{errors.rating}</p>}
          </div>

          <Separator />

          {/* Display Order */}
          <div className="space-y-2">
            <Label htmlFor="displayOrder" style={{ color: 'var(--text-primary)' }}>
              Display Order
            </Label>
            <Input
              id="displayOrder"
              type="number"
              min="0"
              value={formData.displayOrder}
              onChange={(e) => handleInputChange('displayOrder', parseInt(e.target.value) || 0)}
              style={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
            {errors.displayOrder && <p className="text-destructive text-sm">{errors.displayOrder}</p>}
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between rounded-lg border p-4" style={{ borderColor: 'var(--border)' }}>
            <div className="space-y-0.5">
              <Label htmlFor="isActive" className="text-base" style={{ color: 'var(--text-primary)' }}>
                Active
              </Label>
              <SheetDescription style={{ color: 'var(--text-secondary)' }}>
                Set whether this testimonial is visible on the website.
              </SheetDescription>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange('isActive', checked)}
              disabled={loading}
            />
          </div>

          <SheetFooter className="flex-col gap-2 border-t pt-4 pb-6 mt-auto px-0" style={{ borderColor: 'var(--border)' }}>
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 size-4" /> {isEditMode ? 'Update' : 'Create'} Testimonial
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="w-full"
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

export default TestimonialFormSheet

