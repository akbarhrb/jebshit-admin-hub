import React, { useRef, useState } from 'react';
import { Video, X, Loader2 } from 'lucide-react';
import { useYouTubeUpload } from '@/hooks/useYouTubeUpload';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface VideoUploadProps {
  onChange: (youtubeId: string | undefined) => void;
  title?: string;
  description?: string;
  className?: string;
  maxSizeMB?: number;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ 
  onChange, 
  title = 'Untitled Video',
  description,
  className = '',
  maxSizeMB = 100
}) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { uploadVideo, isUploading } = useYouTubeUpload();

  const handleFileChange = async (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(t('media.videoTooLarge', { size: maxSizeMB }));
      return;
    }

    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      toast.error(t('media.invalidVideoType'));
      return;
    }

    try {
      const youtubeId = await uploadVideo(file, title, description);
      onChange(youtubeId);
      toast.success(t('media.videoUploaded'));
    } catch (error) {
      toast.error(t('media.videoUploadFailed'));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileChange(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) {
      handleFileChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/ogg,video/quicktime"
        onChange={handleInputChange}
        className="hidden"
        disabled={isUploading}
      />
      
      <div
        onClick={() => !isUploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg transition-colors
          ${isUploading ? 'cursor-wait' : 'cursor-pointer'}
          ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-secondary/50'}
        `}
      >
        <div className="p-3 rounded-full bg-secondary mb-2">
          {isUploading ? (
            <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
          ) : (
            <Video className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {isUploading ? t('media.uploadingToYouTube') : t('media.clickToUploadVideo')}
        </p>
        <p className="text-xs text-muted-foreground mt-1">MP4, WebM {t('media.upTo')} {maxSizeMB}MB</p>
      </div>
    </div>
  );
};

interface YouTubePreviewProps {
  youtubeId: string;
  onRemove: () => void;
  disabled?: boolean;
}

export const YouTubePreview: React.FC<YouTubePreviewProps> = ({ youtubeId, onRemove, disabled }) => {
  return (
    <div className="relative rounded-lg overflow-hidden border border-border bg-secondary/50">
      <iframe
        src={`https://www.youtube.com/embed/${youtubeId}`}
        className="w-full h-32"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="YouTube video"
      />
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className="absolute top-1 end-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default VideoUpload;
