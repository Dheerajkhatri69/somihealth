// lib/slug.js
export function slugify(str = "") {
  return String(str)
    .trim()
    .replace(/\+/g, " ")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .toLowerCase();
}
