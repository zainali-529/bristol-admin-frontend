import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const statusConfig = {
  new: {
    label: 'New',
    className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  read: {
    label: 'Read',
    className: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
  },
  resolved: {
    label: 'Resolved',
    className: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  },
}

function StatusBadge({ status, className }) {
  const config = statusConfig[status] || statusConfig.new

  return (
    <Badge
      variant="outline"
      className={cn('font-medium', config.className, className)}
    >
      {config.label}
    </Badge>
  )
}

export default StatusBadge

