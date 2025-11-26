import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { createDocument, updateDocument, fetchDocumentById, clearSelectedDocument } from '@/store/documentsSlice'
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
import { FileUp, XCircle, FileText, Loader2 } from 'lucide-react'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional().nullable(),
  category: z.enum(['contracts', 'quotes', 'invoices', 'reports', 'policies', 'certificates', 'legal', 'marketing', 'other']),
  tags: z.string().optional().nullable(),
  file: z.any()
    .refine((file) => {
      if (typeof file === 'string' && file.startsWith('http')) return true
      return file instanceof FileList ? file.length > 0 : false
    }, 'File is required')
    .refine((file) => {
      if (typeof file === 'string' && file.startsWith('http')) return true
      return file instanceof FileList && file[0] ? file[0].size <= MAX_FILE_SIZE : true
    }, `Max file size is 50MB.`),
  accessLevel: z.enum(['private', 'internal', 'public']).default('private'),
  isPublic: z.boolean().default(false),
  expiresAt: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  isArchived: z.boolean().default(false),
})

function DocumentFormSheet({ open, onOpenChange, documentId, onSaveSuccess }) {
  const dispatch = useAppDispatch()
  const { selectedDocument, loading, categories } = useAppSelector((state) => state.documents)
  const isEditMode = !!documentId
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(isEditMode ? formSchema.omit({ file: true }) : formSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'other',
      tags: '',
      file: '',
      accessLevel: 'private',
      isPublic: false,
      expiresAt: '',
      isActive: true,
      isArchived: false,
    },
  })

  const category = watch('category')
  const accessLevel = watch('accessLevel')
  const isPublic = watch('isPublic')
  const isActive = watch('isActive')
  const isArchived = watch('isArchived')

  useEffect(() => {
    if (documentId && open) {
      dispatch(fetchDocumentById(documentId))
    }
  }, [documentId, open, dispatch])

  useEffect(() => {
    if (selectedDocument && isEditMode) {
      reset({
        title: selectedDocument.title || '',
        description: selectedDocument.description || '',
        category: selectedDocument.category || 'other',
        tags: selectedDocument.tags?.join(', ') || '',
        accessLevel: selectedDocument.accessLevel || 'private',
        isPublic: selectedDocument.isPublic || false,
        expiresAt: selectedDocument.expiresAt ? new Date(selectedDocument.expiresAt).toISOString().split('T')[0] : '',
        isActive: selectedDocument.isActive !== undefined ? selectedDocument.isActive : true,
        isArchived: selectedDocument.isArchived || false,
      })
      if (selectedDocument.file?.url) {
        setFilePreview(selectedDocument.file.url)
      }
    } else if (!isEditMode) {
      reset({
        title: '',
        description: '',
        category: 'other',
        tags: '',
        accessLevel: 'private',
        isPublic: false,
        expiresAt: '',
        isActive: true,
        isArchived: false,
      })
      setSelectedFile(null)
      setFilePreview(null)
    }
  }, [selectedDocument, isEditMode, reset])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file size (50MB)
      if (file.size > MAX_FILE_SIZE) {
        toast.error('File size must be less than 50MB')
        return
      }

      setSelectedFile(file)
      setValue('file', e.target.files)

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => setFilePreview(e.target.result)
        reader.readAsDataURL(file)
      } else {
        setFilePreview(null)
      }
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setFilePreview(null)
    setValue('file', '')
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const onSubmit = async (data) => {
    try {
      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('description', data.description || '')
      formData.append('category', data.category)
      formData.append('tags', data.tags || '')
      formData.append('accessLevel', data.accessLevel)
      formData.append('isPublic', data.isPublic)
      formData.append('expiresAt', data.expiresAt || '')
      formData.append('isActive', data.isActive)
      formData.append('isArchived', data.isArchived)

      if (!isEditMode) {
        if (!selectedFile) {
          toast.error('Please select a file to upload')
          return
        }
        formData.append('file', selectedFile)
        await dispatch(createDocument(formData)).unwrap()
        toast.success('Document uploaded successfully')
      } else {
        await dispatch(updateDocument({ id: documentId, documentData: formData })).unwrap()
        toast.success('Document updated successfully')
      }

      onOpenChange(false)
      reset()
      setSelectedFile(null)
      setFilePreview(null)
      dispatch(clearSelectedDocument())
      if (onSaveSuccess) {
        onSaveSuccess()
      }
    } catch (error) {
      toast.error(error || 'Failed to save document')
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-2xl overflow-hidden">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle style={{ color: 'var(--text-primary)' }}>
            {isEditMode ? 'Edit Document' : 'Upload New Document'}
          </SheetTitle>
          <SheetDescription style={{ color: 'var(--text-secondary)' }}>
            {isEditMode
              ? 'Update document information. To upload a new version, use the version control feature.'
              : 'Upload a new document to the system. Supported formats: PDF, Word, Excel, PowerPoint, Images, and more.'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-6 min-h-0">
          {/* File Upload */}
          {!isEditMode && (
            <div className="space-y-2">
              <Label htmlFor="file" style={{ color: 'var(--text-primary)' }}>Document File *</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center" style={{ borderColor: 'var(--border)' }}>
                {selectedFile ? (
                  <div className="space-y-4">
                    {filePreview ? (
                      <img src={filePreview} alt="Preview" className="max-h-48 mx-auto rounded" />
                    ) : (
                      <FileText className="h-12 w-12 mx-auto" style={{ color: 'var(--text-secondary)' }} />
                    )}
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{selectedFile.name}</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={removeFile}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div>
                    <FileUp className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
                    <Label htmlFor="file" className="cursor-pointer">
                      <span className="font-medium" style={{ color: 'var(--primary)' }}>Click to upload</span>
                      <span style={{ color: 'var(--text-secondary)' }}> or drag and drop</span>
                    </Label>
                    <Input
                      id="file"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.jpg,.jpeg,.png,.gif,.webp"
                    />
                    <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                      Max file size: 50MB
                    </p>
                  </div>
                )}
              </div>
              {errors.file && (
                <p className="text-sm text-destructive">{errors.file.message}</p>
              )}
            </div>
          )}

          <Separator />

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" style={{ color: 'var(--text-primary)' }}>Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Enter document title"
              style={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)'
              }}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" style={{ color: 'var(--text-primary)' }}>Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter document description"
              rows={4}
              style={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)'
              }}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" style={{ color: 'var(--text-primary)' }}>Category *</Label>
            <Select value={category} onValueChange={(value) => setValue('category', value)}>
              <SelectTrigger
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)'
                }}
              >
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <SelectItem value="contracts">Contracts</SelectItem>
                <SelectItem value="quotes">Quotes</SelectItem>
                <SelectItem value="invoices">Invoices</SelectItem>
                <SelectItem value="reports">Reports</SelectItem>
                <SelectItem value="policies">Policies</SelectItem>
                <SelectItem value="certificates">Certificates</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category.message}</p>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags" style={{ color: 'var(--text-primary)' }}>Tags (comma-separated)</Label>
            <Input
              id="tags"
              {...register('tags')}
              placeholder="e.g., important, contract, 2024"
              style={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)'
              }}
            />
            {errors.tags && (
              <p className="text-sm text-destructive">{errors.tags.message}</p>
            )}
          </div>

          {/* Access Level */}
          <div className="space-y-2">
            <Label htmlFor="accessLevel" style={{ color: 'var(--text-primary)' }}>Access Level</Label>
            <Select value={accessLevel} onValueChange={(value) => setValue('accessLevel', value)}>
              <SelectTrigger
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)'
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="internal">Internal</SelectItem>
                <SelectItem value="public">Public</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Is Public */}
          <div className="flex items-center justify-between">
            <Label htmlFor="isPublic" style={{ color: 'var(--text-primary)' }}>Public Document</Label>
            <Switch
              id="isPublic"
              checked={isPublic}
              onCheckedChange={(checked) => setValue('isPublic', checked)}
            />
          </div>

          {/* Expires At */}
          <div className="space-y-2">
            <Label htmlFor="expiresAt" style={{ color: 'var(--text-primary)' }}>Expires At (Optional)</Label>
            <Input
              id="expiresAt"
              type="date"
              {...register('expiresAt')}
              style={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)'
              }}
            />
            {errors.expiresAt && (
              <p className="text-sm text-destructive">{errors.expiresAt.message}</p>
            )}
          </div>

          {isEditMode && (
            <>
              <Separator />
              
              {/* Is Active */}
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive" style={{ color: 'var(--text-primary)' }}>Active</Label>
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={(checked) => setValue('isActive', checked)}
                />
              </div>

              {/* Is Archived */}
              <div className="flex items-center justify-between">
                <Label htmlFor="isArchived" style={{ color: 'var(--text-primary)' }}>Archived</Label>
                <Switch
                  id="isArchived"
                  checked={isArchived}
                  onCheckedChange={(checked) => setValue('isArchived', checked)}
                />
              </div>
            </>
          )}

          </div>

          <SheetFooter className="flex-shrink-0 mt-4 p-4 border-t">
            <div className="flex gap-3 w-full">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || loading} className="flex-1">
                {(isSubmitting || loading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'Update' : 'Upload'}
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

export default DocumentFormSheet

