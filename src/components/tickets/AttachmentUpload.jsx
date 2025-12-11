import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, Upload, FileText, Image as ImageIcon } from 'lucide-react';

function AttachmentUpload({ onFilesChange, maxFiles = 5, maxSizeBytes = 10485760 }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    
    if (selectedFiles.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const validFiles = files.filter((file) => {
      if (file.size > maxSizeBytes) {
        alert(`${file.name} exceeds 10MB limit`);
        return false;
      }
      return true;
    });

    const newFiles = [...selectedFiles, ...validFiles];
    setSelectedFiles(newFiles);
    onFilesChange(newFiles);
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesChange(newFiles);
  };

  const isImage = (file) => {
    return file.type.startsWith('image/');
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
        onChange={handleFileSelect}
        className="hidden"
      />

      {selectedFiles.length < maxFiles && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="w-full"
        >
          <Upload className="size-4 mr-2" />
          Attach Files ({selectedFiles.length}/{maxFiles})
        </Button>
      )}

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          {selectedFiles.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 p-2 border rounded bg-muted/50"
            >
              {isImage(file) ? (
                <ImageIcon className="size-4 text-blue-500" />
              ) : (
                <FileText className="size-4 text-gray-500" />
              )}
              <span className="text-sm flex-1 truncate">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFile(idx)}
                className="h-6 w-6 p-0"
              >
                <X className="size-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AttachmentUpload;
