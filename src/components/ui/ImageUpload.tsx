import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useFirebaseStorage } from '@/hooks/useFirebaseStorage';
import { toast } from 'sonner';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  className?: string;
  storagePath?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  value, 
  onChange, 
  className = '',
  storagePath = 'images'
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { uploadImage, deleteImage, isUploading } = useFirebaseStorage();

  const handleFileChange = async (file: File) => {
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    try {
      const url = await uploadImage(file, storagePath);
      onChange(url);
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
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
    if (file && file.type.startsWith('image/')) {
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

  const handleRemove = async () => {
    if (value) {
      await deleteImage(value);
    }
    onChange(undefined);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        disabled={isUploading}
      />
      
      {value ? (
        <div className="relative rounded-lg overflow-hidden border border-border">
          <img src={value} alt="Uploaded" className="w-full h-48 object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            disabled={isUploading}
            className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => !isUploading && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg transition-colors
            ${isUploading ? 'cursor-wait' : 'cursor-pointer'}
            ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-secondary/50'}
          `}
        >
          <div className="p-3 rounded-full bg-secondary mb-3">
            {isUploading ? (
              <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
            ) : (
              <ImageIcon className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {isUploading ? 'Uploading...' : 'Click or drag image to upload'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
