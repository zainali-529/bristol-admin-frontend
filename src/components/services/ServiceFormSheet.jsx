import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { createService, updateService, fetchServiceById, clearSelectedService } from '@/store/servicesSlice'
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
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ImageUp, XCircle, Plus, Trash2 } from 'lucide-react'
import * as LucideIcons from 'lucide-react'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title cannot exceed 100 characters'),
  cardDescription: z.string().min(1, 'Card description is required').max(200, 'Card description cannot exceed 200 characters'),
  cardIcon: z.string().min(1, 'Card icon is required').max(50, 'Icon name cannot exceed 50 characters'),
  aboutService: z.string().min(1, 'About service is required').max(2000, 'About service cannot exceed 2000 characters'),
  mainImage: z.any()
    .refine((file) => {
      if (typeof file === 'string' && file.startsWith('http')) return true // Existing image URL
      return file instanceof FileList ? file.length > 0 : false
    }, 'Main image is required')
    .refine((file) => {
      if (typeof file === 'string' && file.startsWith('http')) return true
      return file instanceof FileList && file[0] ? file[0].size <= MAX_FILE_SIZE : true
    }, `Max image size is 5MB.`),
  secondaryImages: z.any().optional(), // Optional secondary images
  servicesIncludeDescription: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  expertiseDescription: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  servicesBenefitsDescription: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  displayOrder: z.coerce.number().min(0, 'Order must be non-negative').default(0),
  metaTitle: z.string().max(60, 'Meta title cannot exceed 60 characters').optional().nullable(),
  metaDescription: z.string().max(160, 'Meta description cannot exceed 160 characters').optional().nullable(),
})

const popularIcons = [
  'Zap', 'ShieldCheck', 'Award', 'Clock', 'DollarSign', 'Leaf', 'Lightbulb', 'Users', 'Settings', 'Star',
  'TrendingUp', 'Globe', 'MessageSquare', 'Briefcase', 'Home', 'CheckCircle', 'BarChart2', 'Cloud', 'BatteryCharging', 'Sun',
  'Wrench', 'Hammer', 'Cog', 'Tool', 'Plug', 'FlashIcon', 'Power', 'Battery', 'Cpu', 'HardDrive'
]

function ServiceFormSheet({ open, onOpenChange, serviceId, onSaveSuccess }) {
  const dispatch = useAppDispatch()
  const { selectedService, loading, error } = useAppSelector((state) => state.services)
  const isEditMode = !!serviceId
  const [mainImagePreview, setMainImagePreview] = useState(null)
  const [secondaryImagePreviews, setSecondaryImagePreviews] = useState([])
  const [bulletPoints, setBulletPoints] = useState([{ text: '', order: 1 }])
  const [expertiseCards, setExpertiseCards] = useState([{ title: '', description: '', icon: 'Star', order: 1 }])
  const [benefitPoints, setBenefitPoints] = useState([{ text: '', order: 1 }])

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
        cardIcon: '',
        aboutService: '',
        mainImage: '',
        secondaryImages: '',
        servicesIncludeDescription: 'Our comprehensive service includes:',
        expertiseDescription: 'Our expertise areas:',
        servicesBenefitsDescription: 'Benefits of our services:',
        isActive: true,
        isFeatured: false,
        displayOrder: 0,
        metaTitle: '',
        metaDescription: '',
      },
  })

  const watchedCardIcon = watch('cardIcon')
  const watchedMainImage = watch('mainImage')
  const watchedSecondaryImages = watch('secondaryImages')
  const watchedTitle = watch('title')
  const watchedCardDescription = watch('cardDescription')
  const watchedAboutService = watch('aboutService')
  const watchedServicesIncludeDesc = watch('servicesIncludeDescription')
  const watchedExpertiseDesc = watch('expertiseDescription')
  const watchedBenefitsDesc = watch('servicesBenefitsDescription')

  useEffect(() => {
    if (open) {
      if (isEditMode && serviceId) {
        // Open sheet immediately, fetch data inside
        dispatch(fetchServiceById(serviceId))
      } else {
        // Reset form for new service
        reset()
        setMainImagePreview(null)
        setSecondaryImagePreviews([])
        setBulletPoints([{ text: '', order: 1 }])
        setExpertiseCards([{ title: '', description: '', icon: 'Star', order: 1 }])
        setBenefitPoints([{ text: '', order: 1 }])
        dispatch(clearSelectedService())
      }
    } else {
      // Clear when sheet closes
      dispatch(clearSelectedService())
    }
  }, [dispatch, open, isEditMode, serviceId, reset])

  useEffect(() => {
    if (isEditMode && selectedService) {
      reset({
        title: selectedService.title,
        cardDescription: selectedService.cardDescription,
        cardIcon: selectedService.cardIcon,
        aboutService: selectedService.aboutService,
        mainImage: selectedService.mainImage?.url || '',
        secondaryImages: '',
        servicesIncludeDescription: selectedService.servicesInclude?.description || 'Our comprehensive service includes:',
        expertiseDescription: selectedService.expertise?.description || 'Our expertise areas:',
        servicesBenefitsDescription: selectedService.servicesBenefits?.description || 'Benefits of our services:',
        isActive: selectedService.isActive,
        isFeatured: selectedService.isFeatured,
        displayOrder: selectedService.displayOrder,
        metaTitle: selectedService.metaTitle || '',
        metaDescription: selectedService.metaDescription || '',
      })
      setMainImagePreview(selectedService.mainImage?.url || null)
      
      // Set secondary images previews
      if (selectedService.secondaryImages?.length > 0) {
        setSecondaryImagePreviews(selectedService.secondaryImages.map(img => img.url))
      }
      
      // Set bullet points
      if (selectedService.servicesInclude?.bulletPoints?.length > 0) {
        setBulletPoints(selectedService.servicesInclude.bulletPoints.map((bp, index) => ({
          text: bp.text,
          order: bp.order || index + 1
        })))
      }
      
      // Set expertise cards
      if (selectedService.expertise?.cards?.length > 0) {
        setExpertiseCards(selectedService.expertise.cards.map((card, index) => ({
          title: card.title,
          description: card.description,
          icon: card.icon,
          order: card.order || index + 1
        })))
      }
      
      // Set benefit points
      if (selectedService.servicesBenefits?.bulletPoints?.length > 0) {
        setBenefitPoints(selectedService.servicesBenefits.bulletPoints.map((bp, index) => ({
          text: bp.text,
          order: bp.order || index + 1
        })))
      }
    }
  }, [isEditMode, selectedService, reset])

  useEffect(() => {
    if (watchedMainImage && watchedMainImage instanceof FileList && watchedMainImage.length > 0) {
      const file = watchedMainImage[0]
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = () => {
          setMainImagePreview(reader.result)
        }
        reader.onerror = () => {
          console.error('Error reading file')
          setMainImagePreview(null)
        }
        reader.readAsDataURL(file)
      }
    } else if (typeof watchedMainImage === 'string' && watchedMainImage.startsWith('http')) {
      setMainImagePreview(watchedMainImage)
    } else if (!watchedMainImage || (watchedMainImage instanceof FileList && watchedMainImage.length === 0)) {
      // Only clear if not in edit mode or if explicitly cleared
      if (!isEditMode || !selectedService?.mainImage?.url) {
        setMainImagePreview(null)
      }
    }
  }, [watchedMainImage, isEditMode, selectedService])

  useEffect(() => {
    if (watchedSecondaryImages && watchedSecondaryImages instanceof FileList && watchedSecondaryImages.length > 0) {
      const files = Array.from(watchedSecondaryImages).slice(0, 2) // Max 2 secondary images
      const previewPromises = files.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result)
          reader.readAsDataURL(file)
        })
      })
      
      Promise.all(previewPromises).then((previews) => {
        setSecondaryImagePreviews(previews)
      })
    } else if (!watchedSecondaryImages || (watchedSecondaryImages instanceof FileList && watchedSecondaryImages.length === 0)) {
      // Keep existing previews if editing and no new files selected
      if (!isEditMode) {
        setSecondaryImagePreviews([])
      }
    }
  }, [watchedSecondaryImages, isEditMode])

  const addBulletPoint = () => {
    setBulletPoints([...bulletPoints, { text: '', order: bulletPoints.length + 1 }])
  }

  const removeBulletPoint = (index) => {
    if (bulletPoints.length > 1) {
      setBulletPoints(bulletPoints.filter((_, i) => i !== index))
    }
  }

  const updateBulletPoint = (index, field, value) => {
    const updated = [...bulletPoints]
    updated[index][field] = value
    setBulletPoints(updated)
  }

  const addExpertiseCard = () => {
    setExpertiseCards([...expertiseCards, { title: '', description: '', icon: 'Star', order: expertiseCards.length + 1 }])
  }

  const removeExpertiseCard = (index) => {
    if (expertiseCards.length > 1) {
      setExpertiseCards(expertiseCards.filter((_, i) => i !== index))
    }
  }

  const updateExpertiseCard = (index, field, value) => {
    const updated = [...expertiseCards]
    updated[index][field] = value
    setExpertiseCards(updated)
  }

  const addBenefitPoint = () => {
    setBenefitPoints([...benefitPoints, { text: '', order: benefitPoints.length + 1 }])
  }

  const removeBenefitPoint = (index) => {
    if (benefitPoints.length > 1) {
      setBenefitPoints(benefitPoints.filter((_, i) => i !== index))
    }
  }

  const updateBenefitPoint = (index, field, value) => {
    const updated = [...benefitPoints]
    updated[index][field] = value
    setBenefitPoints(updated)
  }

  const onSubmit = async (data) => {
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('cardDescription', data.cardDescription)
    formData.append('cardIcon', data.cardIcon)
    formData.append('aboutService', data.aboutService)
    formData.append('isActive', data.isActive)
    formData.append('isFeatured', data.isFeatured)
    formData.append('displayOrder', data.displayOrder)
    if (data.metaTitle) formData.append('metaTitle', data.metaTitle)
    if (data.metaDescription) formData.append('metaDescription', data.metaDescription)

    // Handle main image
    if (data.mainImage instanceof FileList && data.mainImage.length > 0) {
      formData.append('mainImage', data.mainImage[0])
    }

    // Handle secondary images (max 2)
    if (data.secondaryImages instanceof FileList && data.secondaryImages.length > 0) {
      Array.from(data.secondaryImages).slice(0, 2).forEach((file, index) => {
        formData.append('secondaryImages', file)
        formData.append(`secondaryImageAlt${index}`, '') // Alt text can be added later
        formData.append(`secondaryImageCaption${index}`, '') // Caption can be added later
      })
    }

    // Add services include data
    const servicesInclude = {
      description: data.servicesIncludeDescription || 'Our comprehensive service includes:',
      bulletPoints: bulletPoints.filter(bp => bp.text.trim()).map((bp, index) => ({
        text: bp.text.trim(),
        order: index + 1
      }))
    }
    formData.append('servicesInclude', JSON.stringify(servicesInclude))

    // Add expertise data
    const expertise = {
      description: data.expertiseDescription || 'Our expertise areas:',
      cards: expertiseCards.filter(card => card.title.trim()).map((card, index) => ({
        title: card.title.trim(),
        description: card.description.trim(),
        icon: card.icon,
        order: index + 1
      }))
    }
    formData.append('expertise', JSON.stringify(expertise))

    // Add benefits data
    const servicesBenefits = {
      description: data.servicesBenefitsDescription || 'Benefits of our services:',
      bulletPoints: benefitPoints.filter(bp => bp.text.trim()).map((bp, index) => ({
        text: bp.text.trim(),
        order: index + 1
      }))
    }
    formData.append('servicesBenefits', JSON.stringify(servicesBenefits))

    let result
    if (isEditMode) {
      result = await dispatch(updateService({ id: serviceId, serviceData: formData }))
    } else {
      result = await dispatch(createService(formData))
    }

    if (result.type.endsWith('/fulfilled')) {
      toast.success(`Service ${isEditMode ? 'updated' : 'created'} successfully`)
      onOpenChange(false)
      onSaveSuccess()
    } else {
      toast.error(result.payload || `Failed to ${isEditMode ? 'update' : 'create'} service`)
    }
  }

  const CardIconComponent = watchedCardIcon && LucideIcons[watchedCardIcon] ? LucideIcons[watchedCardIcon] : null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle style={{ color: 'var(--text-primary)' }}>
            {isEditMode ? 'Edit Service' : 'Add New Service'}
          </SheetTitle>
          <SheetDescription style={{ color: 'var(--text-secondary)' }}>
            {isEditMode ? 'Update the service details.' : 'Create a new service for your website.'}
          </SheetDescription>
        </SheetHeader>
        
        {loading && isEditMode && !selectedService ? (
          <div className="flex-1 flex items-center justify-center">Loading service...</div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-y-auto scrollbar-hide p-4 space-y-6">
            {error && (
              <div 
                className="p-3 rounded-md border text-sm"
                style={{ 
                  backgroundColor: 'var(--destructive)',
                  borderColor: 'var(--destructive)',
                  color: 'var(--destructive-foreground)',
                  opacity: 0.9
                }}
              >
                {error}
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Basic Information
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="title" style={{ color: 'var(--text-primary)' }}>Service Title</Label>
                <Input 
                  id="title" 
                  {...register('title')}
                  style={{ 
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                />
                <p className="text-xs text-right" style={{ color: 'var(--text-secondary)' }}>
                  {watchedTitle?.length || 0} / 100 characters
                </p>
                {errors.title && <p className="text-destructive text-sm mt-1">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardDescription" style={{ color: 'var(--text-primary)' }}>Card Description</Label>
                <Textarea 
                  id="cardDescription" 
                  {...register('cardDescription')} 
                  rows={3}
                  style={{ 
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                />
                <p className="text-xs text-right" style={{ color: 'var(--text-secondary)' }}>
                  {watchedCardDescription?.length || 0} / 200 characters
                </p>
                {errors.cardDescription && <p className="text-destructive text-sm mt-1">{errors.cardDescription.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardIcon" style={{ color: 'var(--text-primary)' }}>Card Icon (Lucide Icons)</Label>
                <Input 
                  id="cardIcon" 
                  {...register('cardIcon')} 
                  placeholder="e.g., Zap"
                  style={{ 
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                />
                {CardIconComponent && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Preview:</span>
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                    >
                      <CardIconComponent size={20} />
                    </div>
                  </div>
                )}
                {errors.cardIcon && <p className="text-destructive text-sm mt-1">{errors.cardIcon.message}</p>}
                
                {/* Popular Icons Grid */}
                <div className="mt-4">
                  <Label className="text-sm" style={{ color: 'var(--text-secondary)' }}>Popular Icons:</Label>
                  <div className="mt-2 grid grid-cols-5 gap-2 max-h-32 overflow-y-auto">
                    {popularIcons.map((iconName) => {
                      const PopularIconComponent = LucideIcons[iconName]
                      return PopularIconComponent ? (
                        <Button
                          key={iconName}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setValue('cardIcon', iconName, { shouldValidate: true })}
                          className={`flex flex-col items-center justify-center h-auto py-2 ${
                            watchedCardIcon === iconName ? 'ring-2 ring-primary' : ''
                          }`}
                          style={{ 
                            borderColor: 'var(--border)',
                            color: 'var(--text-primary)',
                            backgroundColor: watchedCardIcon === iconName ? 'var(--primary-5)' : 'transparent'
                          }}
                        >
                          <PopularIconComponent size={16} />
                          <span className="text-xs mt-1">{iconName}</span>
                        </Button>
                      ) : null
                    })}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Images */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Images
              </h3>
              
              {/* Main Image */}
              <div className="space-y-2">
                <Label htmlFor="mainImage" style={{ color: 'var(--text-primary)' }}>Main Image (Required)</Label>
                <div className="flex items-center gap-4">
                  <label 
                    htmlFor="main-image-upload" 
                    className="flex h-32 w-32 cursor-pointer items-center justify-center rounded-md border border-dashed"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    {mainImagePreview ? (
                      <img src={mainImagePreview} alt="Main Image Preview" className="h-full w-full object-cover rounded-md" />
                    ) : (
                      <ImageUp className="size-8" style={{ color: 'var(--text-secondary)' }} />
                    )}
                  </label>
                  <Input
                    id="main-image-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const files = e.target.files
                      if (files && files.length > 0) {
                        const file = files[0]
                        // Create a new FileList-like object
                        const dataTransfer = new DataTransfer()
                        dataTransfer.items.add(file)
                        setValue('mainImage', dataTransfer.files, { shouldValidate: true })
                      } else {
                        setValue('mainImage', null)
                      }
                    }}
                  />
                  {mainImagePreview && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const fileInput = document.getElementById('main-image-upload')
                        if (fileInput) {
                          fileInput.value = ''
                        }
                        setValue('mainImage', null)
                        setMainImagePreview(null)
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <XCircle className="size-5" />
                    </Button>
                  )}
                </div>
                {errors.mainImage && <p className="text-destructive text-sm mt-1">{errors.mainImage.message}</p>}
              </div>

              {/* Secondary Images */}
              <div className="space-y-2">
                <Label htmlFor="secondaryImages" style={{ color: 'var(--text-primary)' }}>
                  Secondary Images (Optional, Max 2)
                </Label>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label 
                      htmlFor="secondary-images-upload" 
                      className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-md border border-dashed"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <ImageUp className="size-6" style={{ color: 'var(--text-secondary)' }} />
                    </label>
                  <Input
                    id="secondary-images-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = e.target.files
                      if (files && files.length > 0) {
                        // Limit to 2 files
                        const dataTransfer = new DataTransfer()
                        Array.from(files).slice(0, 2).forEach(file => dataTransfer.items.add(file))
                        setValue('secondaryImages', dataTransfer.files, { shouldValidate: true })
                      } else {
                        setValue('secondaryImages', null)
                      }
                    }}
                  />
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Upload up to 2 additional images for the service detail page
                    </div>
                  </div>
                  
                  {/* Secondary Images Preview */}
                  {secondaryImagePreviews.length > 0 && (
                    <div className="flex gap-2">
                      {secondaryImagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={preview} 
                            alt={`Secondary ${index + 1}`} 
                            className="h-20 w-20 object-cover rounded-md border"
                            style={{ borderColor: 'var(--border)' }}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground"
                            onClick={() => {
                              const newPreviews = [...secondaryImagePreviews]
                              newPreviews.splice(index, 1)
                              setSecondaryImagePreviews(newPreviews)
                              
                              // Clear the file input
                              const fileInput = document.getElementById('secondary-images-upload')
                              if (fileInput) {
                                fileInput.value = ''
                              }
                              setValue('secondaryImages', null)
                            }}
                          >
                            <XCircle className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* About Service */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                About Service
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="aboutService" style={{ color: 'var(--text-primary)' }}>About Service</Label>
                <Textarea 
                  id="aboutService" 
                  {...register('aboutService')} 
                  rows={4}
                  style={{ 
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                />
                <p className="text-xs text-right" style={{ color: 'var(--text-secondary)' }}>
                  {watchedAboutService?.length || 0} / 2000 characters
                </p>
                {errors.aboutService && <p className="text-destructive text-sm mt-1">{errors.aboutService.message}</p>}
              </div>
            </div>

            <Separator />

            {/* Services Include */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Services Include
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="servicesIncludeDescription" style={{ color: 'var(--text-primary)' }}>
                  Description
                </Label>
                <Input 
                  id="servicesIncludeDescription" 
                  {...register('servicesIncludeDescription')}
                  placeholder="Our comprehensive service includes:"
                  style={{ 
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                />
                <p className="text-xs text-right" style={{ color: 'var(--text-secondary)' }}>
                  {watchedServicesIncludeDesc?.length || 0} / 500 characters
                </p>
              </div>
              
              <div className="space-y-2">
                <Label style={{ color: 'var(--text-primary)' }}>Bullet Points</Label>
                {bulletPoints.map((point, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder="Bullet point text"
                      value={point.text}
                      onChange={(e) => updateBulletPoint(index, 'text', e.target.value)}
                      className="flex-1"
                      style={{ 
                        backgroundColor: 'var(--background)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)'
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeBulletPoint(index)}
                      disabled={bulletPoints.length === 1}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={addBulletPoint}
                  className="w-full"
                  style={{ 
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                    backgroundColor: 'transparent'
                  }}
                >
                  <Plus className="mr-2 size-4" />
                  Add Bullet Point
                </Button>
              </div>
            </div>

            <Separator />

            {/* Expertise */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Expertise
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="expertiseDescription" style={{ color: 'var(--text-primary)' }}>
                  Description
                </Label>
                <Input 
                  id="expertiseDescription" 
                  {...register('expertiseDescription')}
                  placeholder="Our expertise areas:"
                  style={{ 
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                />
                <p className="text-xs text-right" style={{ color: 'var(--text-secondary)' }}>
                  {watchedExpertiseDesc?.length || 0} / 500 characters
                </p>
              </div>
              
              <div className="space-y-2">
                <Label style={{ color: 'var(--text-primary)' }}>Expertise Cards</Label>
                {expertiseCards.map((card, index) => (
                  <div key={index} className="space-y-2 p-4 border rounded-md" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Card title"
                        value={card.title}
                        onChange={(e) => updateExpertiseCard(index, 'title', e.target.value)}
                        className="flex-1"
                        style={{ 
                          backgroundColor: 'var(--background)',
                          borderColor: 'var(--border)',
                          color: 'var(--text-primary)'
                        }}
                      />
                      <Input
                        placeholder="Icon"
                        value={card.icon}
                        onChange={(e) => updateExpertiseCard(index, 'icon', e.target.value)}
                        className="w-24"
                        style={{ 
                          backgroundColor: 'var(--background)',
                          borderColor: 'var(--border)',
                          color: 'var(--text-primary)'
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeExpertiseCard(index)}
                        disabled={expertiseCards.length === 1}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                    <Textarea
                      placeholder="Card description"
                      value={card.description}
                      onChange={(e) => updateExpertiseCard(index, 'description', e.target.value)}
                      rows={2}
                      style={{ 
                        backgroundColor: 'var(--background)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={addExpertiseCard}
                  className="w-full"
                  style={{ 
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                    backgroundColor: 'transparent'
                  }}
                >
                  <Plus className="mr-2 size-4" />
                  Add Expertise Card
                </Button>
              </div>
            </div>

            <Separator />

            {/* Services Benefits */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Services Benefits
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="servicesBenefitsDescription" style={{ color: 'var(--text-primary)' }}>
                  Description
                </Label>
                <Input 
                  id="servicesBenefitsDescription" 
                  {...register('servicesBenefitsDescription')}
                  placeholder="Benefits of our services:"
                  style={{ 
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                />
                <p className="text-xs text-right" style={{ color: 'var(--text-secondary)' }}>
                  {watchedBenefitsDesc?.length || 0} / 500 characters
                </p>
              </div>
              
              <div className="space-y-2">
                <Label style={{ color: 'var(--text-primary)' }}>Benefit Points</Label>
                {benefitPoints.map((point, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder="Benefit point text"
                      value={point.text}
                      onChange={(e) => updateBenefitPoint(index, 'text', e.target.value)}
                      className="flex-1"
                      style={{ 
                        backgroundColor: 'var(--background)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)'
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeBenefitPoint(index)}
                      disabled={benefitPoints.length === 1}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={addBenefitPoint}
                  className="w-full"
                  style={{ 
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                    backgroundColor: 'transparent'
                  }}
                >
                  <Plus className="mr-2 size-4" />
                  Add Benefit Point
                </Button>
              </div>
            </div>

            <Separator />

            {/* Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Settings
              </h3>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive" style={{ color: 'var(--text-primary)' }}>Active</Label>
                <Switch
                  id="isActive"
                  checked={watch('isActive')}
                  onCheckedChange={(checked) => setValue('isActive', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isFeatured" style={{ color: 'var(--text-primary)' }}>Featured</Label>
                <Switch
                  id="isFeatured"
                  checked={watch('isFeatured')}
                  onCheckedChange={(checked) => setValue('isFeatured', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayOrder" style={{ color: 'var(--text-primary)' }}>Display Order</Label>
                <Input 
                  id="displayOrder" 
                  type="number" 
                  {...register('displayOrder')}
                  style={{ 
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                />
                {errors.displayOrder && <p className="text-destructive text-sm mt-1">{errors.displayOrder.message}</p>}
              </div>
            </div>

            <Separator />

            {/* SEO Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                SEO Settings
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="metaTitle" style={{ color: 'var(--text-primary)' }}>Meta Title</Label>
                <Input 
                  id="metaTitle" 
                  {...register('metaTitle')}
                  style={{ 
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                />
                {errors.metaTitle && <p className="text-destructive text-sm mt-1">{errors.metaTitle.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription" style={{ color: 'var(--text-primary)' }}>Meta Description</Label>
                <Textarea 
                  id="metaDescription" 
                  {...register('metaDescription')} 
                  rows={2}
                  style={{ 
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                />
                {errors.metaDescription && <p className="text-destructive text-sm mt-1">{errors.metaDescription.message}</p>}
              </div>
            </div>

            <SheetFooter className="flex-col gap-2 p-4 border-t mt-auto">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
              >
                {isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Service'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)} 
                disabled={isSubmitting}
                style={{ 
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                  backgroundColor: 'transparent'
                }}
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

export default ServiceFormSheet
