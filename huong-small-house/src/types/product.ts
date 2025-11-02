import type { ProductCategory, ProductUnit } from './enums';

export interface Product {
  id: string;
  name: string;
  nameEn?: string;
  slug: string;
  category: ProductCategory;
  subcategory?: string;
  brand: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  unit: ProductUnit;
  quantity: number;
  stock: number;
  images: string[];
  thumbnail: string;
  description: string;
  ingredients?: string[];
  benefits?: string[];
  usage?: string;
  warnings?: string;
  origin: string;
  expiryDate?: Date;
  rating: number;
  reviewCount: number;
  soldCount: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFilter {
  category?: ProductCategory;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  search?: string;
  sortBy?: 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'best-selling';
}
