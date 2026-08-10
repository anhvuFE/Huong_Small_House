import apiClient from '../lib/http';
import type { ContentItem, ContentStatus, ContentType } from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface BackendContent {
  id?: string;
  _id?: string;
  blogId?: number;
  slug?: string;
  title: string;
  type?: ContentType;
  status?: ContentStatus;
  author?: string;
  excerpt?: string;
  thumbnail?: string;
  tags?: string[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
  publishedAt?: string | Date;
  published?: boolean;
  views?: number;
  isActive?: boolean;
  body?: string;
}

const parseDate = (value?: string | Date): Date => {
  const date = value instanceof Date ? value : value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const transformContent = (payload: BackendContent): ContentItem => {
  const id = payload.blogId ?? payload.id ?? payload._id ?? payload.slug ?? payload.title;
  const published = payload.published ?? ((payload.status === 'PUBLISHED') || payload.isActive || false);
  return {
    id: String(id),
    blogId: typeof payload.blogId === 'number' ? payload.blogId : undefined,
    slug: payload.slug ?? String(id),
    title: payload.title,
    type: payload.type ?? 'BLOG',
    status: published ? 'PUBLISHED' : payload.status ?? 'DRAFT',
    author: payload.author ?? 'Không rõ',
    excerpt: payload.excerpt ?? '',
    thumbnail: payload.thumbnail,
    tags: payload.tags ?? [],
    createdAt: parseDate(payload.createdAt),
    updatedAt: parseDate(payload.updatedAt ?? payload.createdAt),
    publishedAt: payload.publishedAt ? parseDate(payload.publishedAt) : undefined,
    views: payload.views ?? 0,
    published,
    isActive: published,
    body: payload.body,
  };
};

export const contentApi = {
  async listContent(): Promise<ContentItem[]> {
    const response = await apiClient.get<ApiResponse<BackendContent[]>>('/blogs/all');
    return response.data.data.map(transformContent);
  },

  async listBlogs(): Promise<ContentItem[]> {
    const response = await apiClient.get<ApiResponse<BackendContent[]>>('/blogs');
    return response.data.data.map(transformContent).filter((item) => item.type === 'BLOG');
  },

  async getBlog(slug: string): Promise<ContentItem> {
    const response = await apiClient.get<ApiResponse<BackendContent>>(`/blogs/${slug}`);
    return transformContent(response.data.data);
  },

  async updateContent(
    id: string,
    payload: {
      title?: string;
      slug?: string;
      excerpt?: string;
      body?: string;
      tags?: string[];
      published?: boolean;
    },
  ): Promise<ContentItem> {
    const blogId = Number(id);
    if (Number.isNaN(blogId)) throw new Error(`Invalid blog id: "${id}"`);
    const data: Record<string, unknown> = {};
    if (payload.title !== undefined) data.title = payload.title;
    if (payload.slug !== undefined) data.slug = payload.slug;
    if (payload.excerpt !== undefined) data.excerpt = payload.excerpt;
    if (payload.body !== undefined) data.content = payload.body;
    if (payload.tags !== undefined) data.tags = payload.tags;
    if (payload.published !== undefined) data.published = payload.published;

    const response = await apiClient.put<ApiResponse<BackendContent>>(`/blogs/${blogId}`, data);
    return transformContent(response.data.data);
  },

  async createContent(payload: {
    title: string;
    slug?: string;
    excerpt?: string;
    body?: string;
    tags?: string[];
    published?: boolean;
  }): Promise<ContentItem> {
    const data: Record<string, unknown> = { title: payload.title };
    if (payload.slug) data.slug = payload.slug;
    if (payload.excerpt !== undefined) data.excerpt = payload.excerpt;
    if (payload.body !== undefined) data.content = payload.body;
    if (payload.tags !== undefined) data.tags = payload.tags;
    if (payload.published !== undefined) data.published = payload.published;

    const response = await apiClient.post<ApiResponse<BackendContent>>('/blogs', data);
    return transformContent(response.data.data);
  },

  async deleteContent(id: string): Promise<void> {
    const blogId = Number(id);
    if (Number.isNaN(blogId)) throw new Error(`Invalid blog id: "${id}"`);
    await apiClient.delete(`/blogs/${blogId}`);
  },
};
