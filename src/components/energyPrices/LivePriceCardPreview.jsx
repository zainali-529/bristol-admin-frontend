import { TrendingUp, TrendingDown, Minus, Zap, Flame } from 'lucide-react'

function LivePriceCardPreview({ 
  type = 'electricity', 
  current, 
  change = 0, 
  trend = 'stable',
  lastUpdate
}) {
  const isElectricity = type === 'electricity'
  
  // Determine colors and icons
  const getTypeConfig = () => {
    if (isElectricity) {
      return {
        icon: Zap,
        color: '#3b82f6',
        bgColor: 'rgba(59, 130, 246, 0.1)',
        label: 'Electricity',
      }
    }
    return {
      icon: Flame,
      color: '#f97316',
      bgColor: 'rgba(249, 115, 22, 0.1)',
      label: 'Gas',
    }
  }

  const getTrendConfig = () => {
    switch (trend) {
      case 'up':
        return {
          icon: TrendingUp,
          color: '#ef4444',
          bgColor: 'rgba(239, 68, 68, 0.1)',
        }
      case 'down':
        return {
          icon: TrendingDown,
          color: '#10b981',
          bgColor: 'rgba(16, 185, 129, 0.1)',
        }
      default:
        return {
          icon: Minus,
          color: 'var(--text-secondary)',
          bgColor: 'var(--primary-5)',
        }
    }
  }

  const typeConfig = getTypeConfig()
  const trendConfig = getTrendConfig()
  const TypeIcon = typeConfig.icon
  const TrendIcon = trendConfig.icon

  return (
    <div
      className="p-6 rounded-2xl relative overflow-hidden"
      style={{
        backgroundColor: 'var(--card)',
        border: '1px solid var(--primary-10)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: typeConfig.bgColor }}
            >
              <TypeIcon size={24} style={{ color: typeConfig.color }} />
            </div>
            <span 
              className="text-base font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              {typeConfig.label}
            </span>
          </div>

          {/* Trend indicator */}
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-full"
            style={{ backgroundColor: trendConfig.bgColor }}
          >
            <TrendIcon size={14} style={{ color: trendConfig.color }} />
            <span 
              className="text-sm font-semibold"
              style={{ color: trendConfig.color }}
            >
              {change > 0 ? '+' : ''}{change.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span 
              className="text-4xl font-black tracking-tight"
              style={{ color: 'var(--primary)' }}
            >
              £{current?.toFixed(4) || '0.0000'}
            </span>
          </div>
          <p 
            className="text-xs mt-1"
            style={{ color: 'var(--text-secondary)' }}
          >
            per kWh
          </p>
        </div>

        {/* Last update */}
        {lastUpdate && (
          <p 
            className="text-xs mt-3"
            style={{ color: 'var(--text-secondary)' }}
          >
            Last updated: {new Date(lastUpdate).toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>
    </div>
  )
}

export default LivePriceCardPreview

