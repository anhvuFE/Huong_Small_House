export const slugify = (value: string, suffix?: string | number): string => {
  const base = value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  if (!suffix) return base;
  return `${base}-${suffix}`;
};

export const extractIdFromSlug = (slug?: string): number | null => {
  if (!slug) return null;
  const parts = slug.split('-');
  const idPart = parts[parts.length - 1];
  const id = Number(idPart);
  return Number.isNaN(id) ? null : id;
};
