export type ContentStatus = 'draft' | 'published';

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  image?: string;
  publishDate: string;
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
  publishDate: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}
