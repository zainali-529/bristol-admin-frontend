import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { createNews, updateNews, fetchNewsById, clearSelectedNews } from '@/store/newsSlice'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ImageUp, XCircle, Plus, Trash2, Loader2 } from 'lucide-react'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_ADDITIONAL_IMAGES = 10

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters'),
  cardDescription: z.string().min(1, 'Card description is required').max(300, 'Card description cannot exceed 300 characters'),
  content: z.string().min(1, 'Content is required').max(10000, 'Content cannot exceed 10000 characters'),
  category: z.string().min(1, 'Category is required').max(50, 'Category cannot exceed 50 characters'),
  tags: z.string().optional(),
  cardImage: z.any()
    .refine((file) => {
      if (typeof file === 'string' && file.startsWith('http')) return true
      return file instanceof FileList ? file.length > 0 : false
    }, 'Card image is required')
    .refine((file) => {
      if (typeof file === 'string' && file.startsWith('http')) return true
      return file instanceof FileList && file[0] ? file[0].size <= MAX_FILE_SIZE : true
    }, `Max image size is 5MB.`),
  featuredImage: z.any()
    .refine((file) => {
      if (typeof file === 'string' && file.startsWith('http')) return true
      return file instanceof FileList ? file.length > 0 : false
    }, 'Featured image is required')
    .refine((file) => {
      if (typeof file === 'string' && file.startsWith('http')) return true
      return file instanceof FileList && file[0] ? file[0].size <= MAX_FILE_SIZE : true
    }, `Max image size is 5MB.`),
  additionalImages: z.any().optional(),
  authorName: z.string().max(100, 'Author name cannot exceed 100 characters').optional().nullable(),
  authorEmail: z.string().email('Invalid email address').optional().nullable(),
  publishDate: z.string().optional().nullable(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isBreaking: z.boolean().default(false),
  displayOrder: z.coerce.number().min(0, 'Order must be non-negative').default(0),
  metaTitle: z.string().max(60, 'Meta title cannot exceed 60 characters').optional().nullable(),
  metaDescription: z.string().max(160, 'Meta description cannot exceed 160 characters').optional().nullable(),
  metaKeywords: z.string().optional().nullable(),
})

function NewsFormSheet({ open, onOpenChange, newsId, onSaveSuccess }) {
  const dispatch = useAppDispatch()
  const { selectedNews, loading, categories } = useAppSelector((state) => state.news)
  const isEditMode = !!newsId
  const [cardImagePreview, setCardImagePreview] = useState(null)
  const [featuredImagePreview, setFeaturedImagePreview] = useState(null)
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState([])

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      cardDescription: '',
      content: '',
      category: '',
      tags: '',
      cardImage: '',
      featuredImage: '',
      additionalImages: '',
      authorName: '',
      authorEmail: '',
      publishDate: '',
      status: 'draft',
      isActive: true,
      isFeatured: false,
      isBreaking: false,
      displayOrder: 0,
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
    },
  })

  const watchedCardImage = watch('cardImage')
  const watchedFeaturedImage = watch('featuredImage')
  const watchedAdditionalImages = watch('additionalImages')

  // Fetch news when editing
  useEffect(() => {
    if (open && isEditMode && newsId) {
      dispatch(fetchNewsById(newsId))
    } else if (!open) {
      dispatch(clearSelectedNews())
      reset()
      setCardImagePreview(null)
      setFeaturedImagePreview(null)
      setAdditionalImagePreviews([])
    }
  }, [open, isEditMode, newsId, dispatch, reset])

  // Populate form when selectedNews is loaded
  useEffect(() => {
    if (selectedNews && isEditMode) {
      reset({
        title: selectedNews.title || '',
        cardDescription: selectedNews.cardDescription || '',
        content: selectedNews.content || '',
        category: selectedNews.category || '',
        tags: selectedNews.tags?.join(', ') || '',
        cardImage: selectedNews.cardImage?.url || '',
        featuredImage: selectedNews.featuredImage?.url || '',
        authorName: selectedNews.author?.name || '',
        authorEmail: selectedNews.author?.email || '',
        publishDate: selectedNews.publishDate ? new Date(selectedNews.publishDate).toISOString().slice(0, 16) : '',
        status: selectedNews.status || 'draft',
        isActive: selectedNews.isActive ?? true,
        isFeatured: selectedNews.isFeatured ?? false,
        isBreaking: selectedNews.isBreaking ?? false,
        displayOrder: selectedNews.displayOrder || 0,
        metaTitle: selectedNews.metaTitle || '',
        metaDescription: selectedNews.metaDescription || '',
        metaKeywords: selectedNews.metaKeywords?.join(', ') || '',
      })
      
      setCardImagePreview(selectedNews.cardImage?.url || null)
      setFeaturedImagePreview(selectedNews.featuredImage?.url || null)
      setAdditionalImagePreviews(selectedNews.additionalImages?.map(img => img.url) || [])
    }
  }, [selectedNews, isEditMode, reset])

  // Handle card image preview
  useEffect(() => {
    if (watchedCardImage && watchedCardImage instanceof FileList && watchedCardImage.length > 0) {
      const file = watchedCardImage[0]
      const reader = new FileReader()
      reader.onload = (e) => {
        setCardImagePreview(e.target.result)
      }
      reader.onerror = () => {
        setCardImagePreview(null)
      }
      reader.readAsDataURL(file)
    } else if (!watchedCardImage || (watchedCardImage instanceof FileList && watchedCardImage.length === 0)) {
      if (!isEditMode || !selectedNews?.cardImage?.url) {
        setCardImagePreview(null)
      }
    }
  }, [watchedCardImage, isEditMode, selectedNews])

  // Handle featured image preview
  useEffect(() => {
    if (watchedFeaturedImage && watchedFeaturedImage instanceof FileList && watchedFeaturedImage.length > 0) {
      const file = watchedFeaturedImage[0]
      const reader = new FileReader()
      reader.onload = (e) => {
        setFeaturedImagePreview(e.target.result)
      }
      reader.onerror = () => {
        setFeaturedImagePreview(null)
      }
      reader.readAsDataURL(file)
    } else if (!watchedFeaturedImage || (watchedFeaturedImage instanceof FileList && watchedFeaturedImage.length === 0)) {
      if (!isEditMode || !selectedNews?.featuredImage?.url) {
        setFeaturedImagePreview(null)
      }
    }
  }, [watchedFeaturedImage, isEditMode, selectedNews])

  // Handle additional images preview
  useEffect(() => {
    if (watchedAdditionalImages && watchedAdditionalImages instanceof FileList && watchedAdditionalImages.length > 0) {
      const files = Array.from(watchedAdditionalImages).slice(0, MAX_ADDITIONAL_IMAGES)
      const previewPromises = files.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result)
          reader.readAsDataURL(file)
        })
      })
      
      Promise.all(previewPromises).then((previews) => {
        setAdditionalImagePreviews(previews)
      })
    } else if (!watchedAdditionalImages || (watchedAdditionalImages instanceof FileList && watchedAdditionalImages.length === 0)) {
      if (!isEditMode) {
        setAdditionalImagePreviews([])
      }
    }
  }, [watchedAdditionalImages, isEditMode])

  // Handle file input change
  const handleFileChange = (field, e) => {
    const file = e.target.files?.[0]
    if (file) {
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      setValue(field, dataTransfer.files, { shouldDirty: true })
    } else {
      setValue(field, '', { shouldDirty: true })
    }
  }

  // Handle multiple file input change
  const handleMultipleFileChange = (field, e) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const dataTransfer = new DataTransfer()
      Array.from(files).slice(0, MAX_ADDITIONAL_IMAGES).forEach(file => {
        dataTransfer.items.add(file)
      })
      setValue(field, dataTransfer.files, { shouldDirty: true })
    } else {
      setValue(field, '', { shouldDirty: true })
    }
  }

  const onSubmit = async (data) => {
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('cardDescription', data.cardDescription)
    formData.append('content', data.content)
    formData.append('category', data.category)
    if (data.tags) {
      formData.append('tags', data.tags)
    }
    formData.append('status', data.status)
    formData.append('isActive', data.isActive)
    formData.append('isFeatured', data.isFeatured)
    formData.append('isBreaking', data.isBreaking)
    formData.append('displayOrder', data.displayOrder)
    
    if (data.authorName) formData.append('author[name]', data.authorName)
    if (data.authorEmail) formData.append('author[email]', data.authorEmail)
    if (data.publishDate) formData.append('publishDate', new Date(data.publishDate).toISOString())
    if (data.metaTitle) formData.append('metaTitle', data.metaTitle)
    if (data.metaDescription) formData.append('metaDescription', data.metaDescription)
    if (data.metaKeywords) formData.append('metaKeywords', data.metaKeywords)

    // Handle card image
    if (data.cardImage instanceof FileList && data.cardImage.length > 0) {
      formData.append('cardImage', data.cardImage[0])
    }

    // Handle featured image
    if (data.featuredImage instanceof FileList && data.featuredImage.length > 0) {
      formData.append('featuredImage', data.featuredImage[0])
    }

    // Handle additional images
    if (data.additionalImages instanceof FileList && data.additionalImages.length > 0) {
      Array.from(data.additionalImages).slice(0, MAX_ADDITIONAL_IMAGES).forEach((file) => {
        formData.append('additionalImages', file)
      })
    }

    let result
    if (isEditMode) {
      result = await dispatch(updateNews({ id: newsId, newsData: formData }))
    } else {
      result = await dispatch(createNews(formData))
    }

    if (result.type.endsWith('/fulfilled')) {
      toast.success(`News article ${isEditMode ? 'updated' : 'created'} successfully`)
      onOpenChange(false)
      onSaveSuccess()
    } else {
      toast.error(result.payload || `Failed to ${isEditMode ? 'update' : 'create'} news article`)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle style={{ color: 'var(--text-primary)' }}>
            {isEditMode ? 'Edit News Article' : 'Create News Article'}
          </SheetTitle>
          <SheetDescription style={{ color: 'var(--text-secondary)' }}>
            {isEditMode ? 'Update the news article details' : 'Fill in the details to create a new news article'}
          </SheetDescription>
        </SheetHeader>

        {loading && !selectedNews && isEditMode ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--primary)' }} />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-y-auto scrollbar-hide p-4 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Basic Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="title" style={{ color: 'var(--text-primary)' }}>Title *</Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="Enter news title"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardDescription" style={{ color: 'var(--text-primary)' }}>Card Description *</Label>
                <Textarea
                  id="cardDescription"
                  {...register('cardDescription')}
                  placeholder="Short description for news card (max 300 characters)"
                  rows={3}
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                />
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {watch('cardDescription')?.length || 0} / 300 characters
                </p>
                {errors.cardDescription && <p className="text-sm text-destructive">{errors.cardDescription.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="content" style={{ color: 'var(--text-primary)' }}>Content *</Label>
                <Textarea
                  id="content"
                  {...register('content')}
                  placeholder="Full article content (max 10000 characters)"
                  rows={10}
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                />
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {watch('content')?.length || 0} / 10000 characters
                </p>
                {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category" style={{ color: 'var(--text-primary)' }}>Category *</Label>
                  <Input
                    id="category"
                    {...register('category')}
                    placeholder="Enter category (e.g., Energy, Business, Technology)"
                    list="category-suggestions"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  {categories.length > 0 && (
                    <datalist id="category-suggestions">
                      {categories.map((cat) => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  )}
                  {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags" style={{ color: 'var(--text-primary)' }}>Tags</Label>
                  <Input
                    id="tags"
                    {...register('tags')}
                    placeholder="Comma-separated tags (max 10)"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Separate tags with commas
                  </p>
                </div>
              </div>
            </div>

            <Separator style={{ backgroundColor: 'var(--border)' }} />

            {/* Images */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Images</h3>
              
              {/* Card Image */}
              <div className="space-y-2">
                <Label htmlFor="cardImage" style={{ color: 'var(--text-primary)' }}>Card Image *</Label>
                <div className="flex gap-4">
                  {cardImagePreview && (
                    <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                      <img src={cardImagePreview} alt="Card preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      id="cardImage"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange('cardImage', e)}
                      style={{
                        backgroundColor: 'var(--background)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)'
                      }}
                    />
                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                      Used in news listing cards (max 5MB)
                    </p>
                  </div>
                </div>
                {errors.cardImage && <p className="text-sm text-destructive">{errors.cardImage.message}</p>}
              </div>

              {/* Featured Image */}
              <div className="space-y-2">
                <Label htmlFor="featuredImage" style={{ color: 'var(--text-primary)' }}>Featured Image *</Label>
                <div className="flex gap-4">
                  {featuredImagePreview && (
                    <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                      <img src={featuredImagePreview} alt="Featured preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      id="featuredImage"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange('featuredImage', e)}
                      style={{
                        backgroundColor: 'var(--background)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)'
                      }}
                    />
                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                      Used in article detail page (max 5MB)
                    </p>
                  </div>
                </div>
                {errors.featuredImage && <p className="text-sm text-destructive">{errors.featuredImage.message}</p>}
              </div>

              {/* Additional Images */}
              <div className="space-y-2">
                <Label htmlFor="additionalImages" style={{ color: 'var(--text-primary)' }}>Additional Images</Label>
                <div className="flex gap-4 flex-wrap">
                  {additionalImagePreviews.map((preview, index) => (
                    <div key={index} className="relative w-24 h-24 border rounded-lg overflow-hidden">
                      <img src={preview} alt={`Additional ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <Input
                  id="additionalImages"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleMultipleFileChange('additionalImages', e)}
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Optional: Up to {MAX_ADDITIONAL_IMAGES} additional images (max 5MB each)
                </p>
              </div>
            </div>

            <Separator style={{ backgroundColor: 'var(--border)' }} />

            {/* Author & Publishing */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Author & Publishing</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="authorName" style={{ color: 'var(--text-primary)' }}>Author Name</Label>
                  <Input
                    id="authorName"
                    {...register('authorName')}
                    placeholder="Author name"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="authorEmail" style={{ color: 'var(--text-primary)' }}>Author Email</Label>
                  <Input
                    id="authorEmail"
                    type="email"
                    {...register('authorEmail')}
                    placeholder="author@example.com"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  {errors.authorEmail && <p className="text-sm text-destructive">{errors.authorEmail.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="publishDate" style={{ color: 'var(--text-primary)' }}>Publish Date</Label>
                  <Input
                    id="publishDate"
                    type="datetime-local"
                    {...register('publishDate')}
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" style={{ color: 'var(--text-primary)' }}>Status *</Label>
                  <Select
                    value={watch('status') || 'draft'}
                    onValueChange={(value) => setValue('status', value, { shouldDirty: true })}
                  >
                    <SelectTrigger
                      id="status"
                      style={{
                        backgroundColor: 'var(--background)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator style={{ backgroundColor: 'var(--border)' }} />

            {/* Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Settings</h3>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive" style={{ color: 'var(--text-primary)' }}>Active</Label>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Show this article on the website
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={watch('isActive')}
                  onCheckedChange={(checked) => setValue('isActive', checked, { shouldDirty: true })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isFeatured" style={{ color: 'var(--text-primary)' }}>Featured</Label>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Mark as featured article
                  </p>
                </div>
                <Switch
                  id="isFeatured"
                  checked={watch('isFeatured')}
                  onCheckedChange={(checked) => setValue('isFeatured', checked, { shouldDirty: true })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isBreaking" style={{ color: 'var(--text-primary)' }}>Breaking News</Label>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Mark as breaking news
                  </p>
                </div>
                <Switch
                  id="isBreaking"
                  checked={watch('isBreaking')}
                  onCheckedChange={(checked) => setValue('isBreaking', checked, { shouldDirty: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayOrder" style={{ color: 'var(--text-primary)' }}>Display Order</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  {...register('displayOrder')}
                  min="0"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                />
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Lower numbers appear first
                </p>
              </div>
            </div>

            <Separator style={{ backgroundColor: 'var(--border)' }} />

            {/* SEO */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>SEO Settings</h3>
              
              <div className="space-y-2">
                <Label htmlFor="metaTitle" style={{ color: 'var(--text-primary)' }}>Meta Title</Label>
                <Input
                  id="metaTitle"
                  {...register('metaTitle')}
                  placeholder="SEO title (max 60 characters)"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                />
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {watch('metaTitle')?.length || 0} / 60 characters
                </p>
                {errors.metaTitle && <p className="text-sm text-destructive">{errors.metaTitle.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription" style={{ color: 'var(--text-primary)' }}>Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  {...register('metaDescription')}
                  placeholder="SEO description (max 160 characters)"
                  rows={2}
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                />
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {watch('metaDescription')?.length || 0} / 160 characters
                </p>
                {errors.metaDescription && <p className="text-sm text-destructive">{errors.metaDescription.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaKeywords" style={{ color: 'var(--text-primary)' }}>Meta Keywords</Label>
                <Input
                  id="metaKeywords"
                  {...register('metaKeywords')}
                  placeholder="Comma-separated keywords"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                />
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Separate keywords with commas
                </p>
              </div>
            </div>

            <SheetFooter className="flex-col gap-2 p-4 border-t mt-auto">
              <Button
                type="submit"
                disabled={isSubmitting || loading}
                style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
              >
                {isSubmitting || loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEditMode ? 'Update Article' : 'Create Article'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting || loading}
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', backgroundColor: 'transparent' }}
              >
                Cancel
              </Button>
            </SheetFooter>
          </form>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default NewsFormSheet

