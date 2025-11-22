export type ContentType = 'PAGE' | 'BLOG' | 'BANNER' | 'ANNOUNCEMENT';
export type ContentStatus = 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';

export interface ContentItem {
  id: string;
  blogId?: number;
  slug: string;
  title: string;
  type: ContentType;
  status: ContentStatus;
  author?: string;
  excerpt?: string;
  thumbnail?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  published?: boolean;
  views: number;
  isActive: boolean; // derived from published
  body?: string;
}
