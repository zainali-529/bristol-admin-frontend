import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { createOrUpdateEnergyPrice, fetchCurrentEnergyPrice, clearSelectedPrice } from '@/store/energyPricesSlice'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const formSchema = z.object({
  electricityPrice: z.coerce.number().min(0, 'Electricity price must be positive'),
  gasPrice: z.coerce.number().min(0, 'Gas price must be positive'),
  marketStatus: z.enum(['rising', 'falling', 'stable']).optional(),
  sentiment: z.enum(['positive', 'negative', 'neutral']).optional(),
  recommendation: z.string().max(500, 'Recommendation cannot exceed 500 characters').optional(),
})

function EnergyPriceFormSheet({ open, onOpenChange, onSaveSuccess }) {
  const dispatch = useAppDispatch()
  const { currentPrice, loading, error } = useAppSelector((state) => state.energyPrices)

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
      electricityPrice: 0,
      gasPrice: 0,
      marketStatus: 'stable',
      sentiment: 'neutral',
      recommendation: '',
    },
  })

  const watchedElectricityPrice = watch('electricityPrice')
  const watchedGasPrice = watch('gasPrice')
  const watchedMarketStatus = watch('marketStatus')
  const watchedSentiment = watch('sentiment')
  const watchedRecommendation = watch('recommendation')

  useEffect(() => {
    if (open) {
      dispatch(fetchCurrentEnergyPrice())
    } else {
      dispatch(clearSelectedPrice())
    }
  }, [dispatch, open])

  useEffect(() => {
    if (currentPrice) {
      reset({
        electricityPrice: currentPrice.electricity?.current || 0,
        gasPrice: currentPrice.gas?.current || 0,
        marketStatus: currentPrice.insights?.marketStatus || 'stable',
        sentiment: currentPrice.insights?.sentiment || 'neutral',
        recommendation: currentPrice.insights?.recommendation || '',
      })
    }
  }, [currentPrice, reset])

  const onSubmit = async (data) => {
    const priceData = {
      electricityPrice: data.electricityPrice,
      gasPrice: data.gasPrice,
      insights: {
        marketStatus: data.marketStatus,
        sentiment: data.sentiment,
        recommendation: data.recommendation || '',
      },
    }

    const result = await dispatch(createOrUpdateEnergyPrice(priceData))

    if (result.type.endsWith('/fulfilled')) {
      toast.success('Energy prices updated successfully')
      onOpenChange(false)
      onSaveSuccess()
    } else {
      toast.error(result.payload || 'Failed to update energy prices')
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle style={{ color: 'var(--text-primary)' }}>
            Update Energy Prices
          </SheetTitle>
          <SheetDescription style={{ color: 'var(--text-secondary)' }}>
            Update current electricity and gas prices, and market insights.
          </SheetDescription>
        </SheetHeader>

        {loading && !currentPrice ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p style={{ color: 'var(--text-secondary)' }}>Loading current prices...</p>
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
                  opacity: 0.9
                }}
              >
                {error}
              </div>
            )}

            {/* Price Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Current Prices
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="electricityPrice" style={{ color: 'var(--text-primary)' }}>
                  Electricity Price (£/kWh)
                </Label>
                <Input 
                  id="electricityPrice" 
                  type="number"
                  step="0.0001"
                  {...register('electricityPrice')}
                  style={{ 
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                />
                {errors.electricityPrice && (
                  <p className="text-destructive text-sm mt-1">{errors.electricityPrice.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gasPrice" style={{ color: 'var(--text-primary)' }}>
                  Gas Price (£/kWh)
                </Label>
                <Input 
                  id="gasPrice" 
                  type="number"
                  step="0.0001"
                  {...register('gasPrice')}
                  style={{ 
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                />
                {errors.gasPrice && (
                  <p className="text-destructive text-sm mt-1">{errors.gasPrice.message}</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Market Insights */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Market Insights
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="marketStatus" style={{ color: 'var(--text-primary)' }}>
                  Market Status
                </Label>
                <Select
                  value={watchedMarketStatus}
                  onValueChange={(value) => setValue('marketStatus', value)}
                >
                  <SelectTrigger 
                    id="marketStatus"
                    style={{ 
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <SelectValue placeholder="Select market status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rising">Rising</SelectItem>
                    <SelectItem value="falling">Falling</SelectItem>
                    <SelectItem value="stable">Stable</SelectItem>
                  </SelectContent>
                </Select>
                {errors.marketStatus && (
                  <p className="text-destructive text-sm mt-1">{errors.marketStatus.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sentiment" style={{ color: 'var(--text-primary)' }}>
                  Market Sentiment
                </Label>
                <Select
                  value={watchedSentiment}
                  onValueChange={(value) => setValue('sentiment', value)}
                >
                  <SelectTrigger 
                    id="sentiment"
                    style={{ 
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <SelectValue placeholder="Select sentiment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                  </SelectContent>
                </Select>
                {errors.sentiment && (
                  <p className="text-destructive text-sm mt-1">{errors.sentiment.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="recommendation" style={{ color: 'var(--text-primary)' }}>
                  Recommendation
                </Label>
                <Textarea 
                  id="recommendation" 
                  {...register('recommendation')} 
                  rows={4}
                  placeholder="Enter market recommendation..."
                  style={{ 
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                />
                <p className="text-xs text-right" style={{ color: 'var(--text-secondary)' }}>
                  {watchedRecommendation?.length || 0} / 500 characters
                </p>
                {errors.recommendation && (
                  <p className="text-destructive text-sm mt-1">{errors.recommendation.message}</p>
                )}
              </div>
            </div>

            <SheetFooter className="flex-col gap-2 p-4 border-t mt-auto">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
              >
                {isSubmitting ? 'Saving...' : 'Update Prices'}
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

export default EnergyPriceFormSheet

