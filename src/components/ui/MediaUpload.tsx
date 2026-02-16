import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Video, Loader2 } from 'lucide-react';
import { useFirebaseStorage } from '@/hooks/useFirebaseStorage';
import { useYouTubeUpload } from '@/hooks/useYouTubeUpload';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface MediaUploadProps {
  imageUrls: string[];
  youtubeIds: string[];
  onImagesChange: (urls: string[]) => void;
  onYouTubeIdsChange: (ids: string[]) => void;
  className?: string;
  storagePath?: string;
  maxImages?: number;
  maxVideos?: number;
  maxImageSizeMB?: number;
  maxVideoSizeMB?: number;
  contentTitle?: string;
}

const MediaUpload: React.FC<MediaUploadProps> = ({
  imageUrls = [],
  youtubeIds = [],
  onImagesChange,
  onYouTubeIdsChange,
  className = '',
  storagePath = 'media',
  maxImages = 10,
  maxVideos = 5,
  maxImageSizeMB = 5,
  maxVideoSizeMB = 100,
  contentTitle = 'Untitled',
}) => {
  const { t } = useTranslation();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { uploadImage, deleteImage, isUploading: isUploadingImage } = useFirebaseStorage();
  const { uploadVideo, isUploading: isUploadingVideo } = useYouTubeUpload();

  const isUploading = isUploadingImage || isUploadingVideo;

  const handleImageFiles = async (files: File[]) => {
    const remainingSlots = maxImages - imageUrls.length;
    if (remainingSlots <= 0) {
      toast.error(t('media.maxFilesReached', { max: maxImages }));
      return;
    }

    const filesToUpload = files.slice(0, remainingSlots);
    const uploadedUrls: string[] = [];

    for (const file of filesToUpload) {
      if (file.size > maxImageSizeMB * 1024 * 1024) {
        toast.error(t('media.fileTooLarge', { name: file.name, size: maxImageSizeMB }));
        continue;
      }

      try {
        const url = await uploadImage(file, `${storagePath}/images`);
        uploadedUrls.push(url);
      } catch (error) {
        toast.error(t('media.uploadFailed', { name: file.name }));
      }
    }

    if (uploadedUrls.length > 0) {
      onImagesChange([...imageUrls, ...uploadedUrls]);
      toast.success(t('media.uploadSuccess', { count: uploadedUrls.length }));
    }
  };

  const handleVideoFile = async (file: File) => {
    if (youtubeIds.length >= maxVideos) {
      toast.error(t('media.maxFilesReached', { max: maxVideos }));
      return;
    }

    if (file.size > maxVideoSizeMB * 1024 * 1024) {
      toast.error(t('media.fileTooLarge', { name: file.name, size: maxVideoSizeMB }));
      return;
    }

    try {
      const youtubeId = await uploadVideo(file, contentTitle);
      onYouTubeIdsChange([...youtubeIds, youtubeId]);
      toast.success(t('media.videoUploaded'));
    } catch (error) {
      toast.error(t('media.videoUploadFailed'));
    }
  };

  const handleImageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const imageFiles = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
      if (imageFiles.length > 0) handleImageFiles(imageFiles);
    }
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleVideoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) handleVideoFile(file);
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    const images = files.filter(f => f.type.startsWith('image/'));
    const videos = files.filter(f => f.type.startsWith('video/'));
    if (images.length > 0) handleImageFiles(images);
    if (videos.length > 0 && videos[0]) handleVideoFile(videos[0]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemoveImage = async (index: number) => {
    const urlToRemove = imageUrls[index];
    try {
      await deleteImage(urlToRemove);
    } catch (error) {
      // Continue even if delete fails
    }
    onImagesChange(imageUrls.filter((_, i) => i !== index));
  };

  const handleRemoveYouTube = (index: number) => {
    onYouTubeIdsChange(youtubeIds.filter((_, i) => i !== index));
  };

  return (
    <div className={className}>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleImageInputChange}
        className="hidden"
        multiple
        disabled={isUploading}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm"
        onChange={handleVideoInputChange}
        className="hidden"
        disabled={isUploading}
      />

      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors
          ${isUploading ? 'cursor-wait' : 'cursor-default'}
          ${isDragging ? 'border-primary bg-primary/5' : 'border-border'}
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
        </div>
        <p className="text-sm text-muted-foreground text-center mb-3">
          {isUploadingVideo ? t('media.uploadingToYouTube') : isUploadingImage ? t('media.uploading') : t('media.dropOrClick')}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => !isUploading && imageUrls.length < maxImages && imageInputRef.current?.click()}
            disabled={isUploading || imageUrls.length >= maxImages}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-secondary hover:bg-secondary/80 transition-colors disabled:opacity-50"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            {t('media.addImages')} ({imageUrls.length}/{maxImages})
          </button>
          <button
            type="button"
            onClick={() => !isUploading && youtubeIds.length < maxVideos && videoInputRef.current?.click()}
            disabled={isUploading || youtubeIds.length >= maxVideos}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-secondary hover:bg-secondary/80 transition-colors disabled:opacity-50"
          >
            <Video className="w-3.5 h-3.5" />
            {t('media.addVideos')} ({youtubeIds.length}/{maxVideos})
          </button>
        </div>
      </div>

      {/* Images Grid */}
      {imageUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          {imageUrls.map((url, index) => (
            <div
              key={url}
              className="relative group rounded-lg overflow-hidden border border-border bg-secondary/30"
            >
              <img
                src={url}
                alt={`Media ${index + 1}`}
                className="w-full h-32 object-cover"
              />
              <div className="absolute bottom-1 start-1 px-1.5 py-0.5 rounded text-xs bg-background/80 text-foreground">
                <ImageIcon className="w-3 h-3 inline-block" />
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  disabled={isUploading}
                  className="p-1.5 bg-destructive text-destructive-foreground rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
                  title={t('media.remove')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* YouTube Videos Grid */}
      {youtubeIds.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {youtubeIds.map((id, index) => (
            <div
              key={id}
              className="relative group rounded-lg overflow-hidden border border-border bg-secondary/30"
            >
              <iframe
                src={`https://www.youtube.com/embed/${id}`}
                className="w-full h-32"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={`YouTube video ${index + 1}`}
              />
              <div className="absolute top-1 end-1">
                <button
                  type="button"
                  onClick={() => handleRemoveYouTube(index)}
                  disabled={isUploading}
                  className="p-1.5 bg-destructive text-destructive-foreground rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
                  title={t('media.remove')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaUpload;
