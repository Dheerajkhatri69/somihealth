import PricingLanding from '@/lib/model/pricingLanding';

export async function getPlanCategories() {
    // Defaults that must always exist:
    const base = [
        { idname: 'semaglutide', title: 'Semaglutide', image: '/pricing/semaglutide.png' },
        { idname: 'tirzepatide', title: 'Tirzepatide', image: '/pricing/tirzepatide.png' },
    ];

    // Pull dynamic options from PricingLanding
    const pl = await PricingLanding.findOne({ 'config.isActive': true }).lean();
    const fromPL = Array.isArray(pl?.options) ? pl.options : [];

    // Merge unique by idname (PL can override image/title if same idname ever appears)
    const map = new Map();
    for (const c of base) map.set(c.idname.toLowerCase(), c);
    for (const o of fromPL) {
        const k = String(o.idname || '').toLowerCase();
        if (!k) continue;
        map.set(k, {
            idname: k,
            title: o.title || k,
            image: o.image || '', // can be empty; UI should handle fallback
        });
    }

    // Return as sorted array (by title)
    return Array.from(map.values()).sort((a, b) => a.title.localeCompare(b.title));
}