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
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { createSupplier, updateSupplier, clearError } from '@/store/suppliersSlice'
import { Upload, Loader2, Save, X, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

function SupplierFormSheet({ open, onOpenChange, supplier = null, onSuccess }) {
  const dispatch = useAppDispatch()
  const { loading } = useAppSelector((state) => state.suppliers)
  const isEdit = !!supplier

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    websiteUrl: '',
    isActive: true,
    displayOrder: 0,
    metaTitle: '',
    metaDescription: '',
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open) {
      if (supplier) {
        setFormData({
          name: supplier.name || '',
          description: supplier.description || '',
          websiteUrl: supplier.websiteUrl || '',
          isActive: supplier.isActive ?? true,
          displayOrder: supplier.displayOrder || 0,
          metaTitle: supplier.metaTitle || '',
          metaDescription: supplier.metaDescription || '',
        })
        setImagePreview(supplier.image?.url || '')
      } else {
        setFormData({
          name: '',
          description: '',
          websiteUrl: '',
          isActive: true,
          displayOrder: 0,
          metaTitle: '',
          metaDescription: '',
        })
        setImagePreview('')
      }
      setImageFile(null)
      setErrors({})
      dispatch(clearError())
    }
  }, [open, supplier, dispatch])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
        return
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }

      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target.result)
      reader.readAsDataURL(file)
      
      if (errors.image) {
        setErrors(prev => ({ ...prev, image: '' }))
      }
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name cannot exceed 100 characters'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters'
    }

    if (!formData.websiteUrl.trim()) {
      newErrors.websiteUrl = 'Website URL is required'
    }

    if (!isEdit && !imageFile) {
      newErrors.image = 'Image is required'
    }

    if (formData.metaTitle && formData.metaTitle.length > 60) {
      newErrors.metaTitle = 'Meta title cannot exceed 60 characters'
    }

    if (formData.metaDescription && formData.metaDescription.length > 160) {
      newErrors.metaDescription = 'Meta description cannot exceed 160 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const submitData = new FormData()
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key])
    })
    
    if (imageFile) {
      submitData.append('image', imageFile)
    }

    try {
      let result
      if (isEdit) {
        result = await dispatch(updateSupplier({ id: supplier._id, formData: submitData }))
      } else {
        result = await dispatch(createSupplier(submitData))
      }

      if (result.type.endsWith('/fulfilled')) {
        toast.success(`Supplier ${isEdit ? 'updated' : 'created'} successfully`)
        onOpenChange(false)
        if (onSuccess) onSuccess()
      } else {
        toast.error(result.payload || `Failed to ${isEdit ? 'update' : 'create'} supplier`)
      }
    } catch (error) {
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} supplier`)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>
            {isEdit ? 'Edit Supplier' : 'Create New Supplier'}
          </SheetTitle>
          <SheetDescription>
            {isEdit ? 'Update supplier information' : 'Add a new supplier to your platform'}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <form onSubmit={handleSubmit} className="space-y-6 p-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter supplier name"
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website URL *</Label>
                <Input
                  id="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                  placeholder="https://example.com"
                  className={errors.websiteUrl ? 'border-destructive' : ''}
                />
                {errors.websiteUrl && (
                  <p className="text-sm text-destructive">{errors.websiteUrl}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter supplier description"
                rows={3}
                className={errors.description ? 'border-destructive' : ''}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Image Upload */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Image</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-24 h-18 object-contain rounded-md border bg-muted/50"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={() => {
                        setImagePreview('')
                        setImageFile(null)
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-24 h-18 border-2 border-dashed border-muted-foreground/25 rounded-md flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                )}
                
                <div className="flex-1">
                  <Label htmlFor="image" className="cursor-pointer">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                      <Upload className="h-4 w-4" />
                      {imagePreview ? 'Change Image' : 'Upload Image'}
                      {!isEdit && ' *'}
                    </div>
                  </Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Max 5MB. Recommended: 400x300px
                  </p>
                </div>
              </div>
              
              {errors.image && (
                <p className="text-sm text-destructive">{errors.image}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive">Active Status</Label>
                  <p className="text-xs text-muted-foreground">
                    Show this supplier on the website
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayOrder">Display Order</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  min="0"
                  value={formData.displayOrder}
                  onChange={(e) => handleInputChange('displayOrder', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground">
                  Lower numbers appear first
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* SEO Fields */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">SEO (Optional)</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                  placeholder="Auto-generated from name if empty"
                  className={errors.metaTitle ? 'border-destructive' : ''}
                />
                {errors.metaTitle && (
                  <p className="text-sm text-destructive">{errors.metaTitle}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formData.metaTitle.length}/60 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                  placeholder="Auto-generated from description if empty"
                  rows={2}
                  className={errors.metaDescription ? 'border-destructive' : ''}
                />
                {errors.metaDescription && (
                  <p className="text-sm text-destructive">{errors.metaDescription}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formData.metaDescription.length}/160 characters
                </p>
              </div>
            </div>
          </div>

          </form>
        </div>

        <SheetFooter className="px-4 py-4 border-t">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} onClick={handleSubmit}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEdit ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEdit ? 'Update Supplier' : 'Create Supplier'}
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default SupplierFormSheet
