import { useEffect, useState, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { createIndustry, updateIndustry, fetchIndustryById, clearSelectedIndustry } from '@/store/industriesSlice'
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
import { Upload, X, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

function IndustryFormSheet({ open, onOpenChange, industryId, onSaveSuccess }) {
  const dispatch = useAppDispatch()
  const { selectedIndustry, loading, error } = useAppSelector((state) => state.industries)
  const isEditMode = !!industryId
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    savings: '',
    displayOrder: 0,
    isActive: true,
    imageAlt: '',
  })
  const [imagePreview, setImagePreview] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [errors, setErrors] = useState({})
  const imageInputRef = useRef(null)

  useEffect(() => {
    if (open) {
      if (isEditMode && industryId) {
        dispatch(fetchIndustryById(industryId))
      } else {
        resetForm()
        dispatch(clearSelectedIndustry())
      }
    } else {
      dispatch(clearSelectedIndustry())
    }
  }, [dispatch, open, isEditMode, industryId])

  useEffect(() => {
    if (isEditMode && selectedIndustry) {
      setFormData({
        title: selectedIndustry.title || '',
        description: selectedIndustry.description || '',
        savings: selectedIndustry.savings || '',
        displayOrder: selectedIndustry.displayOrder || 0,
        isActive: selectedIndustry.isActive ?? true,
        imageAlt: selectedIndustry.image?.alt || '',
      })
      setImagePreview(selectedIndustry.image?.url || null)
      setImageFile(null)
    }
  }, [isEditMode, selectedIndustry])

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      savings: '',
      displayOrder: 0,
      isActive: true,
      imageAlt: '',
    })
    setImagePreview(null)
    setImageFile(null)
    setErrors({})
    if (imageInputRef.current) {
      imageInputRef.current.value = ''
    }
  }

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

    if (file.size > MAX_FILE_SIZE) {
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
    setImagePreview(isEditMode && selectedIndustry?.image?.url ? selectedIndustry.image.url : null)
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
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters'
    }

    if (!formData.savings.trim()) {
      newErrors.savings = 'Savings is required'
    } else if (formData.savings.length > 20) {
      newErrors.savings = 'Savings cannot exceed 20 characters'
    }

    if (formData.displayOrder < 0) {
      newErrors.displayOrder = 'Display order must be non-negative'
    }

    if (!isEditMode && !imageFile && !imagePreview) {
      newErrors.image = 'Image is required'
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
      const submitData = new FormData()
      submitData.append('title', formData.title.trim())
      submitData.append('description', formData.description.trim())
      submitData.append('savings', formData.savings.trim())
      submitData.append('displayOrder', formData.displayOrder.toString())
      submitData.append('isActive', formData.isActive.toString())
      if (formData.imageAlt) {
        submitData.append('imageAlt', formData.imageAlt.trim())
      }
      
      if (imageFile) {
        submitData.append('image', imageFile)
      }

      let result
      if (isEditMode) {
        result = await dispatch(updateIndustry({ id: industryId, industryData: submitData }))
      } else {
        result = await dispatch(createIndustry(submitData))
      }

      if (result.type.endsWith('/fulfilled')) {
        toast.success(`Industry ${isEditMode ? 'updated' : 'created'} successfully`)
        onSaveSuccess?.()
        onOpenChange(false)
        resetForm()
      } else {
        toast.error(result.payload || `Failed to ${isEditMode ? 'update' : 'create'} industry`)
      }
    } catch (error) {
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} industry`)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-2xl overflow-y-auto p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <SheetTitle style={{ color: 'var(--text-primary)' }}>
            {isEditMode ? 'Edit Industry' : 'Create New Industry'}
          </SheetTitle>
          <SheetDescription style={{ color: 'var(--text-secondary)' }}>
            {isEditMode ? 'Update industry information' : 'Add a new industry to your website'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-y-auto px-6 py-6 space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image" style={{ color: 'var(--text-primary)' }}>
              Industry Image <span className="text-destructive">*</span>
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
              placeholder="e.g., Manufacturing"
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
              placeholder="Describe the industry..."
              style={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
            <div className="flex justify-between text-xs">
              {errors.description && <p className="text-destructive">{errors.description}</p>}
              <p className="ml-auto" style={{ color: 'var(--text-secondary)' }}>
                {formData.description.length} / 500 characters
              </p>
            </div>
          </div>

          {/* Savings */}
          <div className="space-y-2">
            <Label htmlFor="savings" style={{ color: 'var(--text-primary)' }}>
              Savings <span className="text-destructive">*</span>
            </Label>
            <Input
              id="savings"
              value={formData.savings}
              onChange={(e) => handleInputChange('savings', e.target.value)}
              placeholder="e.g., 18% or Up to 30%"
              style={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
            <div className="flex justify-between text-xs">
              {errors.savings && <p className="text-destructive">{errors.savings}</p>}
              <p className="ml-auto" style={{ color: 'var(--text-secondary)' }}>
                {formData.savings.length} / 20 characters
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
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label style={{ color: 'var(--text-primary)' }}>Active Status</Label>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Show this industry on the website
              </p>
            </div>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange('isActive', checked)}
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
                  <Save className="mr-2 size-4" /> {isEditMode ? 'Update' : 'Create'} Industry
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

export default IndustryFormSheet

