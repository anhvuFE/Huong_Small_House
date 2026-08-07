import type { Product } from '../types';

/**
 * Chọn ảnh minh hoạ cho sản phẩm.
 * - Nếu thumbnail là URL thật (http) hoặc file .svg -> dùng luôn.
 * - Ngược lại: map theo từ khoá (tên / danh mục / tag) sang bộ SVG có sẵn
 *   trong /public/images/products, để card không còn rơi về logo nền be.
 */
const BASE = '/images/products';

const ILLUSTRATIONS = [
  'collagen',
  'omega-3',
  'probiotic',
  'sleep-aid',
  'biotin',
  'joint-support',
  'coq10',
  'vitamin-d',
  'zinc',
  'vitamin-c',
  'green-tea',
  'multivitamin',
] as const;

// Thứ tự có ý nghĩa: quy tắc cụ thể hơn đứng trước (vd calcium/D3 trước zinc).
const RULES: [RegExp, string][] = [
  [/collagen/, 'collagen'],
  [/omega|fish oil|tim.?mach|heart/, 'omega-3'],
  [/probiotic|tieu.?hoa|digestive/, 'probiotic'],
  [/melatonin|sleep|giac.?ngu/, 'sleep-aid'],
  [/biotin/, 'biotin'],
  [/glucosamine|chondroitin|joint|xuong.?khop/, 'joint-support'],
  [/b.?complex|coq10|coenzyme|energy|nang.?luong/, 'coq10'],
  [/calcium|magnesium|\bd3\b|vitamin d/, 'vitamin-d'],
  [/\bzinc\b|immunity|mien.?dich/, 'zinc'],
  [/vitamin c|vitamin-c/, 'vitamin-c'],
  [/vitamin e/, 'coq10'],
  [/green tea|tra xanh/, 'green-tea'],
  [/multivitamin|multi|iron|\bsat\b/, 'multivitamin'],
];

type ImageInput = Pick<Product, 'thumbnail' | 'name' | 'category' | 'tags' | 'id'>;

export function getProductImage(product: ImageInput): string {
  const thumb = product.thumbnail;
  if (thumb && /^https?:\/\//.test(thumb)) return thumb;
  if (thumb && thumb.endsWith('.svg')) return thumb;

  const hay = `${product.name} ${product.category ?? ''} ${(product.tags ?? []).join(' ')}`.toLowerCase();
  for (const [re, name] of RULES) {
    if (re.test(hay)) return `${BASE}/${name}.svg`;
  }

  // Fallback ổn định theo id (không random để tránh nhấp nháy khi re-render).
  const sum = String(product.id)
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return `${BASE}/${ILLUSTRATIONS[sum % ILLUSTRATIONS.length]}.svg`;
}
