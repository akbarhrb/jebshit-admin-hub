import { useState, useCallback } from 'react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';

interface UseFirebaseStorageReturn {
  uploadImage: (file: File, path?: string) => Promise<string>;
  deleteImage: (url: string) => Promise<void>;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
}

export function useFirebaseStorage(): UseFirebaseStorageReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = useCallback(async (file: File, path?: string): Promise<string> => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const storagePath = path ? `${path}/${fileName}` : `images/${fileName}`;
      const storageRef = ref(storage, storagePath);

      // Upload the file
      setUploadProgress(50);
      const snapshot = await uploadBytes(storageRef, file);
      setUploadProgress(80);

      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      setUploadProgress(100);

      return downloadURL;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const deleteImage = useCallback(async (url: string): Promise<void> => {
    try {
      // Extract the path from the URL
      const decodedUrl = decodeURIComponent(url);
      const pathMatch = decodedUrl.match(/\/o\/(.+?)\?/);
      
      if (pathMatch && pathMatch[1]) {
        const filePath = pathMatch[1];
        const storageRef = ref(storage, filePath);
        await deleteObject(storageRef);
      }
    } catch (err) {
      console.error('Failed to delete image:', err);
      // Don't throw - image might already be deleted or URL is invalid
    }
  }, []);

  return {
    uploadImage,
    deleteImage,
    isUploading,
    uploadProgress,
    error,
  };
}
