import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  MessageSquare,
  User 
} from 'lucide-react';

function StatusBadge({ status, userRole = 'admin' }) {
  const getStatusConfig = () => {
    switch (status) {
      case 'open':
        return { 
          label: 'Open', 
          className: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: MessageSquare 
        };
      case 'awaiting-admin-reply':
        return { 
          label: 'Awaiting Admin Reply', 
          className: userRole === 'admin' 
            ? 'bg-orange-100 text-orange-800 border-orange-300' 
            : 'bg-blue-100 text-blue-800 border-blue-300',
          icon: User 
        };
      case 'awaiting-developer-reply':
        return { 
          label: 'Awaiting Developer Reply', 
          className: userRole === 'developer' 
            ? 'bg-orange-100 text-orange-800 border-orange-300' 
            : 'bg-blue-100 text-blue-800 border-blue-300',
          icon: User 
        };
      case 'in-progress':
        return { 
          label: 'In Progress', 
          className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          icon: Clock 
        };
      case 'resolved':
        return { 
          label: 'Resolved', 
          className: 'bg-green-100 text-green-800 border-green-300',
          icon: CheckCircle2 
        };
      case 'closed':
        return { 
          label: 'Closed', 
          className: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: XCircle 
        };
      default:
        return { 
          label: status, 
          className: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: AlertCircle 
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.className} flex items-center gap-1`}>
      <Icon className="size-3" />
      {config.label}
    </Badge>
  );
}

export default StatusBadge;
