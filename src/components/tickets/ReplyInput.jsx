import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';
import AttachmentUpload from './AttachmentUpload';
import axios from '@/lib/axios';

function ReplyInput({ ticketId, onReplySent }) {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim() && files.length === 0) return;

    setSending(true);
    try {
      const formData = new FormData();
      formData.append('message', message);
      files.forEach((file) => {
        formData.append('attachments', file);
      });

      const res = await axios.post(`/tickets/${ticketId}/comments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success !== false) {
        setMessage('');
        setFiles([]);
        onReplySent && onReplySent(res.data?.data);
      }
    } catch (err) {
      console.error('Failed to send reply:', err);
      alert('Failed to send reply. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="border-t p-4 bg-card space-y-3">
      <Textarea
        placeholder="Type your reply..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        className="resize-none"
        disabled={sending}
      />

      <AttachmentUpload onFilesChange={setFiles} />

      <div className="flex justify-end">
        <Button
          onClick={handleSend}
          disabled={sending || (!message.trim() && files.length === 0)}
          style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          {sending ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="size-4 mr-2" />
              Send Reply
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default ReplyInput;
