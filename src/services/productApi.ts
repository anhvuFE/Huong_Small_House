import apiClient from '../lib/http';
import type { Category, Product } from '../types';
import { slugify } from '../utils/slugify';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface BackendImage {
  url: string;
  alt?: string;
}

export interface BackendProduct {
  _id?: string;
  productId: number;
  name: string;
  brand: string;
  categoryId: number;
  description?: string;
  price: number;
  stock: number;
  images?: BackendImage[];
  rating?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendCategory {
  _id?: string;
  categoryId: number;
  name: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductPayload {
  name: string;
  brand: string;
  categoryId: number;
  description?: string;
  price: number;
  stock: number;
  images: BackendImage[];
}

export interface CategoryPayload {
  name: string;
  slug?: string;
}

const toCategory = (payload: BackendCategory): Category => {
  const createdAt = payload.createdAt ? new Date(payload.createdAt) : new Date();
  const updatedAt = payload.updatedAt ? new Date(payload.updatedAt) : createdAt;
  return {
    id: payload._id ?? payload.categoryId.toString(),
    categoryId: payload.categoryId,
    name: payload.name,
    slug: payload.slug,
    createdAt,
    updatedAt,
  };
};

const toProduct = (payload: BackendProduct, categories?: Map<number, BackendCategory>): Product => {
  const createdAt = payload.createdAt ? new Date(payload.createdAt) : new Date();
  const updatedAt = payload.updatedAt ? new Date(payload.updatedAt) : createdAt;
  const categoryMeta = categories?.get(payload.categoryId);
  const categoryName = categoryMeta?.name ?? 'Sản phẩm';
  const categorySlug = categoryMeta?.slug ?? 'products';
    const images = payload.images?.map((image) => image.url) ?? [];
  const thumbnail = images[0] ?? 'https://placehold.co/600x400?text=Small+House';

  return {
    id: payload._id ?? payload.productId.toString(),
    productId: payload.productId,
    slug: slugify(payload.name, payload.productId),
    name: payload.name,
    brand: payload.brand,
    category: categoryName,
    categoryId: payload.categoryId,
    price: payload.price,
    originalPrice: undefined,
    unit: undefined,
    quantity: payload.stock,
    stock: payload.stock,
    images,
    thumbnail,
    description: payload.description ?? 'Đang cập nhật mô tả sản phẩm.',
    origin: 'Việt Nam',
    rating: payload.rating ?? 5,
    reviewCount: 0,
    soldCount: 0,
    tags: [categorySlug],
    createdAt,
    updatedAt,
    nameEn: undefined,
    subcategory: undefined,
    discount: undefined,
    benefits: undefined,
    ingredients: undefined,
    usage: undefined,
    warnings: undefined,
    expiryDate: undefined,
    isNew: false,
    isBestSeller: false,
    isFeatured: false,
  };
};

const buildCategoryMap = (categories?: Category[]): Map<number, BackendCategory> | undefined => {
  if (!categories) return undefined;
  const map = new Map<number, BackendCategory>();
  categories.forEach((category) => {
    map.set(category.categoryId, {
      _id: category.id,
      categoryId: category.categoryId,
      name: category.name,
      slug: category.slug,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    });
  });
  return map;
};

export const productApi = {
  async listProducts(categories?: Category[]): Promise<Product[]> {
    const categoryMap = buildCategoryMap(categories);
    const response = await apiClient.get<ApiResponse<BackendProduct[]>>('/products');
    return response.data.data.map((item) => toProduct(item, categoryMap));
  },

  async getProduct(productId: number, categories?: Category[]): Promise<Product> {
    const categoryMap = buildCategoryMap(categories);
    const response = await apiClient.get<ApiResponse<BackendProduct>>(`/products/${productId}`);
    return toProduct(response.data.data, categoryMap);
  },

  async createProduct(payload: ProductPayload): Promise<Product> {
    const response = await apiClient.post<ApiResponse<BackendProduct>>('/products', payload);
    return toProduct(response.data.data);
  },

  async updateProduct(productId: number, payload: ProductPayload): Promise<Product> {
    const response = await apiClient.put<ApiResponse<BackendProduct>>(`/products/${productId}`, payload);
    return toProduct(response.data.data);
  },

  async deleteProduct(productId: number): Promise<void> {
    await apiClient.delete(`/products/${productId}`);
  },

  async listCategories(): Promise<Category[]> {
    const response = await apiClient.get<ApiResponse<BackendCategory[]>>('/products/categories/all');
    return response.data.data.map(toCategory);
  },

  async createCategory(payload: CategoryPayload): Promise<Category> {
    const response = await apiClient.post<ApiResponse<BackendCategory>>('/products/categories', payload);
    return toCategory(response.data.data);
  },
};
