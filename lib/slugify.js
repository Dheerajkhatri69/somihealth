// Consistent slug for IDs/paths
export function slugifyId(s = '') {
    return s
        .toString()
        .normalize('NFKD')                // strip accents
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')            // spaces -> hyphen
        .replace(/[^a-z0-9-]/g, '')      // drop everything else (so "+" disappears)
        .replace(/-+/g, '-')             // collapse dashes
        .replace(/^-+|-+$/g, '');        // trim dashes
}
