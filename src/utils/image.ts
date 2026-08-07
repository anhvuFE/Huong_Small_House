/**
 * Trả về URL ảnh dùng được để hiển thị, hoặc null nếu không hợp lệ.
 * Hợp lệ: ảnh remote (http/https), ảnh local trong /images, hoặc file .svg.
 * Loại: rỗng và các placeholder.
 */
export function resolveImageUrl(thumbnail?: string | null): string | null {
  if (!thumbnail) return null;
  if (thumbnail.includes('placeholder') || thumbnail.includes('placehold')) return null;
  if (
    thumbnail.startsWith('http') ||
    thumbnail.startsWith('/images/') ||
    thumbnail.endsWith('.svg')
  ) {
    return thumbnail;
  }
  return null;
}
