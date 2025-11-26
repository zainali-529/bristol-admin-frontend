import React, { useState, useRef } from 'react';
import { Upload, X, Video, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

/**
 * MediaUploadCard Component
 * Reusable component for uploading video or image with drag & drop support
 * 
 * @param {Object} props
 * @param {string} props.type - 'video' or 'image'
 * @param {string} props.currentUrl - Current media URL
 * @param {string} props.label - Label for the upload section
 * @param {number} props.maxSize - Maximum file size in MB
 * @param {string[]} props.acceptedFormats - Array of accepted file formats
 * @param {Function} props.onUpload - Callback when file is selected
 * @param {Function} props.onDelete - Callback when delete is clicked
 * @param {boolean} props.uploading - Whether upload is in progress
 * @param {boolean} props.disabled - Whether the component is disabled
 */
const MediaUploadCard = ({
  type = 'video',
  currentUrl,
  label,
  maxSize = 100,
  acceptedFormats = [],
  onUpload,
  onDelete,
  uploading = false,
  disabled = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const fileInputRef = useRef(null);

  const isVideo = type === 'video';
  const Icon = isVideo ? Video : ImageIcon;
  
  const defaultAcceptedFormats = isVideo 
    ? ['mp4', 'webm', 'mov']
    : ['jpg', 'jpeg', 'png', 'webp'];
  
  const formats = acceptedFormats.length > 0 ? acceptedFormats : defaultAcceptedFormats;
  const acceptString = isVideo 
    ? 'video/mp4,video/webm,video/quicktime'
    : 'image/jpeg,image/jpg,image/png,image/webp';

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || uploading) return;

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (disabled || uploading) return;

    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file) => {
    // Validate file type
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!formats.includes(fileExtension)) {
      alert(`Invalid file type. Accepted formats: ${formats.join(', ')}`);
      return;
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      alert(`File size exceeds ${maxSize}MB limit`);
      return;
    }

    // Call onUpload callback
    if (onUpload) {
      onUpload(file);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (onDelete) {
      onDelete();
    }
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Label */}
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">{label || `${isVideo ? 'Video' : 'Image'} Upload`}</Label>
              <span className="text-sm text-muted-foreground">Max: {maxSize}MB</span>
            </div>

            {/* Preview Section */}
            {currentUrl && !uploading && (
              <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                {isVideo ? (
                  <video
                    src={currentUrl}
                    controls
                    className="w-full h-48 object-cover"
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    src={currentUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                  />
                )}
                
                {/* Delete Button Overlay */}
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={handleDeleteClick}
                  disabled={disabled || uploading}
                >
                  <X className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            )}

            {/* Upload Section */}
            <div
              className={`
                relative border-2 border-dashed rounded-lg p-8 transition-colors
                ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 dark:border-gray-700'}
                ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary'}
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={handleButtonClick}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptString}
                onChange={handleChange}
                disabled={disabled || uploading}
                className="hidden"
              />

              <div className="flex flex-col items-center justify-center text-center space-y-3">
                {uploading ? (
                  <>
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    <p className="text-sm font-medium">Uploading...</p>
                    <p className="text-xs text-muted-foreground">Please wait while your file is being uploaded</p>
                  </>
                ) : (
                  <>
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        <span className="text-primary">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formats.map(f => f.toUpperCase()).join(', ')} up to {maxSize}MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={disabled || uploading}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleButtonClick();
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Info Text */}
            <p className="text-xs text-muted-foreground">
              {isVideo 
                ? 'Upload a high-quality video for the best viewing experience. The video will loop automatically.'
                : 'Upload a high-resolution image for the best quality. Recommended dimensions: 1920x1080px.'
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {isVideo ? 'Video' : 'Image'}?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {isVideo ? 'video' : 'image'}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MediaUploadCard;


