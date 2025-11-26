import { useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar, TrendingUp, TrendingDown, Minus, Zap, Flame, Activity } from 'lucide-react'
import { format } from 'date-fns'
import PriceHistoryChart from './PriceHistoryChart'

function PriceHistoryDetailSheet({ open, onOpenChange, priceData }) {
  if (!priceData) return null

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={16} style={{ color: '#ef4444' }} />
      case 'down':
        return <TrendingDown size={16} style={{ color: '#10b981' }} />
      default:
        return <Minus size={16} style={{ color: 'var(--text-secondary)' }} />
    }
  }

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up':
        return '#ef4444'
      case 'down':
        return '#10b981'
      default:
        return 'var(--text-secondary)'
    }
  }

  const electricityHistory = priceData.electricity?.history || []
  const gasHistory = priceData.gas?.history || []

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-3xl">
        <SheetHeader>
          <SheetTitle style={{ color: 'var(--text-primary)' }}>
            Price History Details
          </SheetTitle>
          <SheetDescription style={{ color: 'var(--text-secondary)' }}>
            Detailed view of energy price history from {format(new Date(priceData.createdAt), 'PP')}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-6">
          {/* Current Prices Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              className="p-6 rounded-xl"
              style={{ backgroundColor: 'var(--card)', border: '1px solid var(--primary-10)' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                >
                  <Zap size={20} style={{ color: '#3b82f6' }} />
                </div>
                <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Electricity
                </h4>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Current:</span>
                  <span className="text-2xl font-bold" style={{ color: '#3b82f6' }}>
                    £{priceData.electricity?.current?.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Average:</span>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    £{priceData.electricity?.average?.toFixed(4) || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>High:</span>
                  <span className="font-medium" style={{ color: '#ef4444' }}>
                    £{priceData.electricity?.high?.toFixed(4) || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Low:</span>
                  <span className="font-medium" style={{ color: '#10b981' }}>
                    £{priceData.electricity?.low?.toFixed(4) || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div 
              className="p-6 rounded-xl"
              style={{ backgroundColor: 'var(--card)', border: '1px solid var(--primary-10)' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)' }}
                >
                  <Flame size={20} style={{ color: '#f97316' }} />
                </div>
                <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Gas
                </h4>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Current:</span>
                  <span className="text-2xl font-bold" style={{ color: '#f97316' }}>
                    £{priceData.gas?.current?.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Average:</span>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    £{priceData.gas?.average?.toFixed(4) || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>High:</span>
                  <span className="font-medium" style={{ color: '#ef4444' }}>
                    £{priceData.gas?.high?.toFixed(4) || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Low:</span>
                  <span className="font-medium" style={{ color: '#10b981' }}>
                    £{priceData.gas?.low?.toFixed(4) || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Price History Chart */}
          <div>
            <h4 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Price Trends
            </h4>
            <div 
              className="p-4 rounded-xl"
              style={{ backgroundColor: 'var(--card)', border: '1px solid var(--primary-10)' }}
            >
              <PriceHistoryChart 
                electricityHistory={electricityHistory}
                gasHistory={gasHistory}
                showElectricity={true}
                showGas={true}
              />
            </div>
          </div>

          <Separator />

          {/* Market Insights */}
          {priceData.insights && (
            <>
              <div>
                <h4 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Market Insights
                </h4>
                <div 
                  className="p-6 rounded-xl"
                  style={{ 
                    backgroundColor: priceData.insights.sentiment === 'positive' ? 'rgba(16, 185, 129, 0.1)' :
                                    priceData.insights.sentiment === 'negative' ? 'rgba(239, 68, 68, 0.1)' :
                                    'var(--primary-5)',
                    border: '1px solid var(--primary-10)'
                  }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Activity 
                      size={20} 
                      style={{ 
                        color: priceData.insights.sentiment === 'positive' ? '#10b981' :
                               priceData.insights.sentiment === 'negative' ? '#ef4444' :
                               'var(--primary)'
                      }} 
                    />
                    <h5 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Market Analysis
                    </h5>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Status:</span>
                      <Badge 
                        variant="secondary"
                        style={{ 
                          backgroundColor: 'var(--primary-10)',
                          color: 'var(--primary)'
                        }}
                      >
                        {priceData.insights.marketStatus || 'stable'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Sentiment:</span>
                      <Badge 
                        variant="secondary"
                        style={{ 
                          backgroundColor: priceData.insights.sentiment === 'positive' ? 'rgba(16, 185, 129, 0.2)' :
                                          priceData.insights.sentiment === 'negative' ? 'rgba(239, 68, 68, 0.2)' :
                                          'var(--primary-10)',
                          color: priceData.insights.sentiment === 'positive' ? '#10b981' :
                                 priceData.insights.sentiment === 'negative' ? '#ef4444' :
                                 'var(--text-secondary)'
                        }}
                      >
                        {priceData.insights.sentiment || 'neutral'}
                      </Badge>
                    </div>
                    {priceData.insights.recommendation && (
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                          Recommendation:
                        </p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {priceData.insights.recommendation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Detailed History Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Electricity History */}
            <div>
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Zap size={18} style={{ color: '#3b82f6' }} />
                Electricity History
              </h4>
              <div 
                className="rounded-xl overflow-hidden"
                style={{ border: '1px solid var(--primary-10)' }}
              >
                <div className="max-h-96 overflow-y-auto scrollbar-hide">
                  <table className="w-full">
                    <thead 
                      className="sticky top-0 z-10"
                      style={{ backgroundColor: 'var(--primary-5)' }}
                    >
                      <tr>
                        <th className="text-left p-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          Date
                        </th>
                        <th className="text-right p-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          Price
                        </th>
                        <th className="text-right p-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          Change
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {electricityHistory.map((entry, index) => (
                        <tr 
                          key={index}
                          className="border-t"
                          style={{ borderColor: 'var(--primary-10)' }}
                        >
                          <td className="p-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {format(new Date(entry.date), 'MMM dd, yyyy')}
                          </td>
                          <td className="p-3 text-sm text-right font-medium" style={{ color: 'var(--text-primary)' }}>
                            £{entry.price.toFixed(4)}
                          </td>
                          <td className="p-3 text-sm text-right">
                            <div className="flex items-center justify-end gap-1">
                              {getTrendIcon(entry.trend)}
                              <span style={{ color: getTrendColor(entry.trend) }}>
                                {entry.change > 0 ? '+' : ''}{entry.change.toFixed(2)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Gas History */}
            <div>
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Flame size={18} style={{ color: '#f97316' }} />
                Gas History
              </h4>
              <div 
                className="rounded-xl overflow-hidden"
                style={{ border: '1px solid var(--primary-10)' }}
              >
                <div className="max-h-96 overflow-y-auto scrollbar-hide">
                  <table className="w-full">
                    <thead 
                      className="sticky top-0 z-10"
                      style={{ backgroundColor: 'var(--primary-5)' }}
                    >
                      <tr>
                        <th className="text-left p-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          Date
                        </th>
                        <th className="text-right p-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          Price
                        </th>
                        <th className="text-right p-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          Change
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {gasHistory.map((entry, index) => (
                        <tr 
                          key={index}
                          className="border-t"
                          style={{ borderColor: 'var(--primary-10)' }}
                        >
                          <td className="p-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {format(new Date(entry.date), 'MMM dd, yyyy')}
                          </td>
                          <td className="p-3 text-sm text-right font-medium" style={{ color: 'var(--text-primary)' }}>
                            £{entry.price.toFixed(4)}
                          </td>
                          <td className="p-3 text-sm text-right">
                            <div className="flex items-center justify-end gap-1">
                              {getTrendIcon(entry.trend)}
                              <span style={{ color: getTrendColor(entry.trend) }}>
                                {entry.change > 0 ? '+' : ''}{entry.change.toFixed(2)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div 
            className="p-4 rounded-xl"
            style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}
          >
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Created At:</p>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {format(new Date(priceData.createdAt), 'PPpp')}
                </p>
              </div>
              <div>
                <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Last Updated:</p>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {format(new Date(priceData.updatedAt), 'PPpp')}
                </p>
              </div>
              <div>
                <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Status:</p>
                <Badge variant={priceData.isActive ? 'default' : 'secondary'}>
                  {priceData.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div>
                <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Total Entries:</p>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Electricity: {electricityHistory.length}, Gas: {gasHistory.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default PriceHistoryDetailSheet

