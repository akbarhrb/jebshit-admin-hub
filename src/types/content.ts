export type ContentStatus = 'draft' | 'published';

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  content: string;
  date: string;
  isUrgent: boolean;
  mediaUrls: string[];
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Martyr {
  id: string;
  name: string;
  photo?: string;
  dateOfMartyrdom: string;
  biography: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SheikhStory {
  id: string;
  title: string;
  content: string;
  images: string[];
  videos: string[];
  publishDate: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MosqueActivity {
  id: string;
  title: string;
  description: string;
  content: string;
  date: string;
  images: string[];
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ReligiousTopic {
  id: string;
  title: string;
  description: string;
  content: string;
  images: string[];
  videos: string[];
  publishDate: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export type JobType = 'full-time' | 'part-time' | 'temporary';

export interface JobOpportunity {
  id: string;
  title: string;
  description: string;
  jobType: JobType;
  location: string;
  contactInfo: string;
  content: string;
  publishDate: string;
  expiryDate?: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface VillageMemory {
  id: string;
  title: string;
  description: string;
  content: string;
  images: string[];
  videos: string[];
  memoryDate?: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}
