import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Video, Loader2 } from 'lucide-react';
import { useFirebaseStorage } from '@/hooks/useFirebaseStorage';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface MediaItem {
  url: string;
  type: 'image' | 'video';
}

interface MediaUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  className?: string;
  storagePath?: string;
  maxFiles?: number;
  maxImageSizeMB?: number;
  maxVideoSizeMB?: number;
}

const MediaUpload: React.FC<MediaUploadProps> = ({
  value = [],
  onChange,
  className = '',
  storagePath = 'media',
  maxFiles = 10,
  maxImageSizeMB = 5,
  maxVideoSizeMB = 100,
}) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { uploadImage, deleteImage, isUploading } = useFirebaseStorage();

  const getMediaType = (url: string): 'image' | 'video' => {
    const videoExtensions = ['.mp4', '.mov', '.webm', '.ogg', '.quicktime'];
    const lowerUrl = url.toLowerCase();
    return videoExtensions.some(ext => lowerUrl.includes(ext) || lowerUrl.includes('video')) 
      ? 'video' 
      : 'image';
  };

  const mediaItems: MediaItem[] = value.map(url => ({
    url,
    type: getMediaType(url),
  }));

  const handleFileChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remainingSlots = maxFiles - value.length;
    if (remainingSlots <= 0) {
      toast.error(t('media.maxFilesReached', { max: maxFiles }));
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    const uploadedUrls: string[] = [];

    for (const file of filesToUpload) {
      // Validate file type
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (!isImage && !isVideo) {
        toast.error(t('media.invalidFileType', { name: file.name }));
        continue;
      }

      // Validate file size
      const maxSize = isImage ? maxImageSizeMB : maxVideoSizeMB;
      if (file.size > maxSize * 1024 * 1024) {
        toast.error(t('media.fileTooLarge', { name: file.name, size: maxSize }));
        continue;
      }

      try {
        const subPath = isVideo ? `${storagePath}/videos` : `${storagePath}/images`;
        const url = await uploadImage(file, subPath);
        uploadedUrls.push(url);
      } catch (error) {
        toast.error(t('media.uploadFailed', { name: file.name }));
      }
    }

    if (uploadedUrls.length > 0) {
      onChange([...value, ...uploadedUrls]);
      toast.success(t('media.uploadSuccess', { count: uploadedUrls.length }));
    }

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e.target.files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemove = async (index: number) => {
    const urlToRemove = value[index];
    try {
      await deleteImage(urlToRemove);
    } catch (error) {
      // Continue even if delete fails
    }
    const newUrls = value.filter((_, i) => i !== index);
    onChange(newUrls);
  };

  const moveItem = (fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= value.length) return;
    
    const newUrls = [...value];
    [newUrls[fromIndex], newUrls[toIndex]] = [newUrls[toIndex], newUrls[fromIndex]];
    onChange(newUrls);
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
        onChange={handleInputChange}
        className="hidden"
        multiple
        disabled={isUploading}
      />

      {/* Upload Zone */}
      <div
        onClick={() => !isUploading && value.length < maxFiles && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors
          ${isUploading ? 'cursor-wait' : value.length >= maxFiles ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-secondary/50'}
        `}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-full bg-secondary">
            {isUploading ? (
              <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
            ) : (
              <Upload className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div className="p-2 rounded-full bg-secondary">
            <ImageIcon className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="p-2 rounded-full bg-secondary">
            <Video className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground text-center">
          {isUploading ? t('media.uploading') : t('media.dropOrClick')}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {t('media.supportedFormats')} ({value.length}/{maxFiles})
        </p>
      </div>

      {/* Media Grid Preview */}
      {mediaItems.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          {mediaItems.map((item, index) => (
            <div
              key={item.url}
              className="relative group rounded-lg overflow-hidden border border-border bg-secondary/30"
            >
              {item.type === 'video' ? (
                <video
                  src={item.url}
                  className="w-full h-32 object-cover"
                  controls
                  preload="metadata"
                />
              ) : (
                <img
                  src={item.url}
                  alt={`Media ${index + 1}`}
                  className="w-full h-32 object-cover"
                />
              )}
              
              {/* Type Badge */}
              <div className="absolute bottom-1 start-1 px-1.5 py-0.5 rounded text-xs bg-background/80 text-foreground">
                {item.type === 'video' ? (
                  <Video className="w-3 h-3 inline-block" />
                ) : (
                  <ImageIcon className="w-3 h-3 inline-block" />
                )}
              </div>

              {/* Controls Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => moveItem(index, 'up')}
                    className="p-1.5 bg-background/90 rounded-full hover:bg-background transition-colors"
                    title={t('media.moveUp')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  disabled={isUploading}
                  className="p-1.5 bg-destructive text-destructive-foreground rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
                  title={t('media.remove')}
                >
                  <X className="w-4 h-4" />
                </button>
                {index < mediaItems.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveItem(index, 'down')}
                    className="p-1.5 bg-background/90 rounded-full hover:bg-background transition-colors"
                    title={t('media.moveDown')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaUpload;
