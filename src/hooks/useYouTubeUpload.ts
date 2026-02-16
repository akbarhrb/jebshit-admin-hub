import { useState, useCallback } from 'react';

const UPLOAD_URL = import.meta.env.VITE_YOUTUBE_UPLOAD_FUNCTION_URL;

interface UseYouTubeUploadReturn {
  uploadVideo: (file: File, title: string, description?: string) => Promise<string>;
  isUploading: boolean;
  error: string | null;
}

export function useYouTubeUpload(): UseYouTubeUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadVideo = useCallback(async (file: File, title: string, description?: string): Promise<string> => {
    if (!UPLOAD_URL) {
      throw new Error('YouTube upload function URL is not configured');
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      if (description) {
        formData.append('description', description);
      }

      const response = await fetch(UPLOAD_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Upload failed with status ${response.status}`);
      }

      const data = await response.json();

      if (!data.youtubeId) {
        throw new Error('No youtubeId returned from upload');
      }

      return data.youtubeId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Video upload failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  }, []);

  return {
    uploadVideo,
    isUploading,
    error,
  };
}
