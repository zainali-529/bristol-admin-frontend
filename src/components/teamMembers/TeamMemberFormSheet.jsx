import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { createTeamMember, updateTeamMember, fetchTeamMemberById, clearSelectedTeamMember } from '@/store/teamMembersSlice'
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
import { Loader2 } from 'lucide-react'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters'),
  position: z.string().min(1, 'Position is required').max(100, 'Position cannot exceed 100 characters'),
  description: z.string().min(1, 'Description is required').max(500, 'Description cannot exceed 500 characters'),
  image: z.any()
    .refine((file) => {
      if (typeof file === 'string' && file.startsWith('http')) return true
      return file instanceof FileList ? file.length > 0 : false
    }, 'Image is required')
    .refine((file) => {
      if (typeof file === 'string' && file.startsWith('http')) return true
      return file instanceof FileList && file[0] ? file[0].size <= MAX_FILE_SIZE : true
    }, `Max image size is 5MB.`),
  linkedin: z.string().optional().refine((val) => !val || val.startsWith('http'), {
    message: 'Invalid LinkedIn URL'
  }),
  email: z.string().optional().refine((val) => !val || z.string().email().safeParse(val).success, {
    message: 'Invalid email address'
  }),
  twitter: z.string().optional().refine((val) => !val || val.startsWith('http'), {
    message: 'Invalid Twitter URL'
  }),
  website: z.string().optional().refine((val) => !val || val.startsWith('http'), {
    message: 'Invalid website URL'
  }),
  isActive: z.boolean().default(true),
  displayOrder: z.coerce.number().min(0, 'Order must be non-negative').default(0),
})

function TeamMemberFormSheet({ open, onOpenChange, teamMemberId, onSaveSuccess }) {
  const dispatch = useAppDispatch()
  const { selectedTeamMember, loading } = useAppSelector((state) => state.teamMembers)
  const isEditMode = !!teamMemberId
  const [imagePreview, setImagePreview] = useState(null)

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
      name: '',
      position: '',
      description: '',
      image: '',
      linkedin: '',
      email: '',
      twitter: '',
      website: '',
      isActive: true,
      displayOrder: 0,
    },
  })

  const watchedImage = watch('image')

  // Fetch team member when editing
  useEffect(() => {
    if (open && isEditMode && teamMemberId) {
      dispatch(fetchTeamMemberById(teamMemberId))
    } else if (!open) {
      dispatch(clearSelectedTeamMember())
      reset()
      setImagePreview(null)
    }
  }, [open, isEditMode, teamMemberId, dispatch, reset])

  // Populate form when selectedTeamMember is loaded
  useEffect(() => {
    if (selectedTeamMember && isEditMode) {
      reset({
        name: selectedTeamMember.name || '',
        position: selectedTeamMember.position || '',
        description: selectedTeamMember.description || '',
        image: selectedTeamMember.image?.url || '',
        linkedin: selectedTeamMember.socialLinks?.linkedin || '',
        email: selectedTeamMember.socialLinks?.email || '',
        twitter: selectedTeamMember.socialLinks?.twitter || '',
        website: selectedTeamMember.socialLinks?.website || '',
        isActive: selectedTeamMember.isActive ?? true,
        displayOrder: selectedTeamMember.displayOrder || 0,
      })
      
      setImagePreview(selectedTeamMember.image?.url || null)
    }
  }, [selectedTeamMember, isEditMode, reset])

  // Handle image preview
  useEffect(() => {
    if (watchedImage && watchedImage instanceof FileList && watchedImage.length > 0) {
      const file = watchedImage[0]
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.onerror = () => {
        setImagePreview(null)
      }
      reader.readAsDataURL(file)
    } else if (!watchedImage || (watchedImage instanceof FileList && watchedImage.length === 0)) {
      if (!isEditMode || !selectedTeamMember?.image?.url) {
        setImagePreview(null)
      }
    }
  }, [watchedImage, isEditMode, selectedTeamMember])

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

  const onSubmit = async (data) => {
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('position', data.position)
    formData.append('description', data.description)
    formData.append('isActive', data.isActive)
    formData.append('displayOrder', data.displayOrder)
    
    if (data.linkedin) formData.append('linkedin', data.linkedin)
    if (data.email) formData.append('email', data.email)
    if (data.twitter) formData.append('twitter', data.twitter)
    if (data.website) formData.append('website', data.website)

    // Handle image
    if (data.image instanceof FileList && data.image.length > 0) {
      formData.append('image', data.image[0])
    }

    let result
    if (isEditMode) {
      result = await dispatch(updateTeamMember({ id: teamMemberId, teamMemberData: formData }))
    } else {
      result = await dispatch(createTeamMember(formData))
    }

    if (result.type.endsWith('/fulfilled')) {
      toast.success(`Team member ${isEditMode ? 'updated' : 'created'} successfully`)
      onOpenChange(false)
      onSaveSuccess()
    } else {
      toast.error(result.payload || `Failed to ${isEditMode ? 'update' : 'create'} team member`)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle style={{ color: 'var(--text-primary)' }}>
            {isEditMode ? 'Edit Team Member' : 'Add Team Member'}
          </SheetTitle>
          <SheetDescription style={{ color: 'var(--text-secondary)' }}>
            {isEditMode ? 'Update the team member details' : 'Add a new team member to your website'}
          </SheetDescription>
        </SheetHeader>

        {loading && !selectedTeamMember && isEditMode ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--primary)' }} />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-y-auto scrollbar-hide p-4 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Basic Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="name" style={{ color: 'var(--text-primary)' }}>Name *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Enter team member name"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="position" style={{ color: 'var(--text-primary)' }}>Position *</Label>
                <Input
                  id="position"
                  {...register('position')}
                  placeholder="e.g., CEO & Founder, Head of Operations"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                />
                {errors.position && <p className="text-sm text-destructive">{errors.position.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" style={{ color: 'var(--text-primary)' }}>Description *</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Brief description about the team member (max 500 characters)"
                  rows={4}
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                />
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {watch('description')?.length || 0} / 500 characters
                </p>
                {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
              </div>
            </div>

            <Separator style={{ backgroundColor: 'var(--border)' }} />

            {/* Image */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Profile Image</h3>
              
              <div className="space-y-2">
                <Label htmlFor="image" style={{ color: 'var(--text-primary)' }}>Image *</Label>
                <div className="flex gap-4">
                  {imagePreview && (
                    <div className="relative w-32 h-40 border rounded-lg overflow-hidden">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange('image', e)}
                      style={{
                        backgroundColor: 'var(--background)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)'
                      }}
                    />
                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                      Recommended: 600x800px (max 5MB)
                    </p>
                  </div>
                </div>
                {errors.image && <p className="text-sm text-destructive">{errors.image.message}</p>}
              </div>
            </div>

            <Separator style={{ backgroundColor: 'var(--border)' }} />

            {/* Social Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Social Links</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedin" style={{ color: 'var(--text-primary)' }}>LinkedIn URL</Label>
                  <Input
                    id="linkedin"
                    {...register('linkedin')}
                    placeholder="https://linkedin.com/in/username"
                    type="url"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  {errors.linkedin && <p className="text-sm text-destructive">{errors.linkedin.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" style={{ color: 'var(--text-primary)' }}>Email</Label>
                  <Input
                    id="email"
                    {...register('email')}
                    placeholder="email@example.com"
                    type="email"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter" style={{ color: 'var(--text-primary)' }}>Twitter URL</Label>
                  <Input
                    id="twitter"
                    {...register('twitter')}
                    placeholder="https://twitter.com/username"
                    type="url"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  {errors.twitter && <p className="text-sm text-destructive">{errors.twitter.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website" style={{ color: 'var(--text-primary)' }}>Website URL</Label>
                  <Input
                    id="website"
                    {...register('website')}
                    placeholder="https://example.com"
                    type="url"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  {errors.website && <p className="text-sm text-destructive">{errors.website.message}</p>}
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
                    Show this team member on the website
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={watch('isActive')}
                  onCheckedChange={(checked) => setValue('isActive', checked, { shouldDirty: true })}
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
                  isEditMode ? 'Update Team Member' : 'Create Team Member'
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

export default TeamMemberFormSheet

