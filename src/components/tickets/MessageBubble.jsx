import { Badge } from '@/components/ui/badge';
import { FileText, Download, Image as ImageIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function MessageBubble({ message, isOwn, authorColor = '#AE613A' }) {
  const formatTimestamp = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return 'Just now';
    }
  };

  const isImage = (filename) => {
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const ext = filename?.split('.').pop()?.toLowerCase();
    return imageExts.includes(ext);
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {message.authorName}
          </span>
          <Badge 
            variant="secondary" 
            className="text-xs"
            style={{ 
              backgroundColor: message.authorRole === 'admin' ? '#AE613A20' : '#2196F320',
              color: message.authorRole === 'admin' ? '#AE613A' : '#2196F3'
            }}
          >
            {message.authorRole}
          </Badge>
        </div>

        <div
          className="rounded-lg px-4 py-3 shadow-sm"
          style={{
            backgroundColor: isOwn ? authorColor : 'var(--muted)',
            color: isOwn ? '#ffffff' : 'var(--text-primary)',
          }}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>

          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.attachments.map((attachment, idx) => (
                <a
                  key={idx}
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 rounded bg-white bg-opacity-20 hover:bg-opacity-30 transition-all"
                >
                  {isImage(attachment.filename) ? (
                    <ImageIcon className="size-4" />
                  ) : (
                    <FileText className="size-4" />
                  )}
                  <span className="text-xs flex-1 truncate">{attachment.filename}</span>
                  <Download className="size-3" />
                </a>
              ))}
            </div>
          )}
        </div>

        <span className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
          {formatTimestamp(message.createdAt)}
        </span>
      </div>
    </div>
  );
}

export default MessageBubble;
