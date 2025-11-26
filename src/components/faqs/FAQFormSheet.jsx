import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { createFAQ, updateFAQ, fetchFAQById, clearSelectedFAQ } from '@/store/faqsSlice'
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

const formSchema = z.object({
  question: z.string().min(1, 'Question is required').max(500, 'Question cannot exceed 500 characters'),
  answer: z.string().min(1, 'Answer is required').max(2000, 'Answer cannot exceed 2000 characters'),
  category: z.string().max(100, 'Category cannot exceed 100 characters').optional(),
  displayOrder: z.coerce.number().min(0, 'Display order must be 0 or greater'),
  isActive: z.boolean(),
})

function FAQFormSheet({ open, onOpenChange, faqId, onSaveSuccess }) {
  const dispatch = useAppDispatch()
  const { selectedFAQ, loading, error } = useAppSelector((state) => state.faqs)
  const isEditMode = !!faqId

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
      question: '',
      answer: '',
      category: 'General',
      displayOrder: 0,
      isActive: true,
    },
  })

  const watchedQuestion = watch('question')
  const watchedAnswer = watch('answer')
  const watchedIsActive = watch('isActive')

  useEffect(() => {
    if (open) {
      if (isEditMode && faqId) {
        dispatch(fetchFAQById(faqId))
      } else {
        reset()
        dispatch(clearSelectedFAQ())
      }
    } else {
      dispatch(clearSelectedFAQ())
    }
  }, [dispatch, open, isEditMode, faqId, reset])

  useEffect(() => {
    if (isEditMode && selectedFAQ) {
      reset({
        question: selectedFAQ.question,
        answer: selectedFAQ.answer,
        category: selectedFAQ.category || 'General',
        displayOrder: selectedFAQ.displayOrder || 0,
        isActive: selectedFAQ.isActive,
      })
    }
  }, [isEditMode, selectedFAQ, reset])

  const onSubmit = async (data) => {
    const faqData = {
      question: data.question,
      answer: data.answer,
      category: data.category || 'General',
      displayOrder: data.displayOrder,
      isActive: data.isActive,
    }

    let result
    if (isEditMode) {
      result = await dispatch(updateFAQ({ id: faqId, faqData }))
    } else {
      result = await dispatch(createFAQ(faqData))
    }

    if (result.type.endsWith('/fulfilled')) {
      toast.success(`FAQ ${isEditMode ? 'updated' : 'created'} successfully`)
      onOpenChange(false)
      onSaveSuccess()
    } else {
      toast.error(result.payload || `Failed to ${isEditMode ? 'update' : 'create'} FAQ`)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col w-full max-w-2xl sm:max-w-md lg:max-w-lg">
        <SheetHeader>
          <SheetTitle style={{ color: 'var(--text-primary)' }}>
            {isEditMode ? 'Edit FAQ' : 'Add New FAQ'}
          </SheetTitle>
          <SheetDescription style={{ color: 'var(--text-secondary)' }}>
            {isEditMode ? 'Update FAQ details below' : 'Fill in the details to create a new FAQ'}
          </SheetDescription>
        </SheetHeader>

        {loading && isEditMode && !selectedFAQ ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
              <p style={{ color: 'var(--text-secondary)' }}>Loading FAQ...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-y-auto scrollbar-hide p-4 space-y-6">
            {error && (
              <div
                className="p-3 rounded-md border text-sm"
                style={{
                  backgroundColor: 'var(--destructive)',
                  borderColor: 'var(--destructive)',
                  color: 'var(--destructive-foreground)',
                  opacity: 0.9,
                }}
              >
                {error}
              </div>
            )}

            {/* Question */}
            <div className="space-y-2">
              <Label htmlFor="question" style={{ color: 'var(--text-primary)' }}>
                Question <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="question"
                {...register('question')}
                rows={3}
                placeholder="What is your question?"
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
              <div className="flex justify-between text-xs">
                {errors.question && <p className="text-destructive">{errors.question.message}</p>}
                <p className="ml-auto" style={{ color: 'var(--text-secondary)' }}>
                  {watchedQuestion?.length || 0} / 500 characters
                </p>
              </div>
            </div>

            {/* Answer */}
            <div className="space-y-2">
              <Label htmlFor="answer" style={{ color: 'var(--text-primary)' }}>
                Answer <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="answer"
                {...register('answer')}
                rows={6}
                placeholder="Provide a detailed answer..."
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
              <div className="flex justify-between text-xs">
                {errors.answer && <p className="text-destructive">{errors.answer.message}</p>}
                <p className="ml-auto" style={{ color: 'var(--text-secondary)' }}>
                  {watchedAnswer?.length || 0} / 2000 characters
                </p>
              </div>
            </div>

            <Separator />

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" style={{ color: 'var(--text-primary)' }}>
                Category
              </Label>
              <Input
                id="category"
                {...register('category')}
                placeholder="e.g., Billing, Account, Technical"
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
              {errors.category && <p className="text-destructive text-sm">{errors.category.message}</p>}
            </div>

            {/* Display Order */}
            <div className="space-y-2">
              <Label htmlFor="displayOrder" style={{ color: 'var(--text-primary)' }}>
                Display Order
              </Label>
              <Input
                id="displayOrder"
                type="number"
                {...register('displayOrder')}
                min="0"
                placeholder="0"
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
              {errors.displayOrder && <p className="text-destructive text-sm">{errors.displayOrder.message}</p>}
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Lower numbers appear first. 0 means highest priority.
              </p>
            </div>

            <Separator />

            {/* Active Status */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isActive" style={{ color: 'var(--text-primary)' }}>
                  Active Status
                </Label>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {watchedIsActive ? 'FAQ is visible to users' : 'FAQ is hidden from users'}
                </p>
              </div>
              <Switch
                id="isActive"
                checked={watchedIsActive}
                onCheckedChange={(checked) => setValue('isActive', checked)}
              />
            </div>

            <SheetFooter className="flex-col gap-2 p-4 border-t mt-auto">
              <Button
                type="submit"
                disabled={isSubmitting}
                style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
              >
                {isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create FAQ'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
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
        )}
      </SheetContent>
    </Sheet>
  )
}

export default FAQFormSheet

