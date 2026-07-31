// [UTIL] Generate URL-safe slug
export const createSlug = (text: string): string => {
  const slug = text
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\u0600-\u06FFa-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  // [FALLBACK] Empty result
  if (!slug) {
    return `item-${Date.now()}`;
  }

  return slug;
};