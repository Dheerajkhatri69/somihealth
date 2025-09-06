'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Eye, Pencil, DollarSign } from 'lucide-react';
import Image from 'next/image';

export default function ProductsIndexPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState('');

    useEffect(() => { fetchData(); }, []);

    async function fetchData() {
        setLoading(true);
        try {
            const res = await fetch('/api/products', { cache: 'no-store' });
            const data = await res.json();
            if (data?.success && data?.result) {
                const flat = flattenProducts(data.result);
                flat.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || (a.label || '').localeCompare(b.label || ''));
                setProducts(flat);
            } else {
                setProducts([]);
            }
        } catch (e) {
            console.error(e);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }

    const filtered = useMemo(() => {
        if (!q.trim()) return products;
        const needle = q.toLowerCase();
        return products.filter(p =>
            (p.label || '').toLowerCase().includes(needle) ||
            (p.category || '').toLowerCase().includes(needle) ||
            (p.slug || '').toLowerCase().includes(needle)
        );
    }, [products, q]);

    return (
        <div className="w-full p-4">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Products</h1>
                    <p className="text-sm text-gray-500">Quick glance — minimal details. Open a product to see more.</p>
                </div>
                <Link
                    href="/dashboard/products/new"
                    className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-white hover:bg-secondary/90"
                >
                    <Plus size={18} />
                    Add
                </Link>
            </div>

            {/* Card */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                {/* Toolbar */}
                <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-700">All Products</span>
                    <span className="ml-auto text-xs rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">{filtered.length}</span>
                    <div className="relative">
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search products…"
                            className="h-9 w-52 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary"
                        />
                        <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none">
                            <path d="M21 21l-4.3-4.3M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                </div>

                {/* List */}
                {loading ? (
                    <ul className="divide-y divide-gray-100">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <li key={i} className="px-5 py-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-gray-200 animate-pulse" />
                                    <div className="h-4 w-1/3 rounded bg-gray-200 animate-pulse" />
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : filtered.length === 0 ? (
                    <div className="p-6 text-sm text-gray-500">
                        {q ? 'No products match your search.' : 'No products found. Add your first product.'}
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {filtered.map((p) => {
                            const id = getProductId(p); // <-- always defined
                            return (
                                <li key={id} className="px-5 py-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex min-w-0 items-center gap-3">
                                            {p.heroImage ? (
                                                <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-white">
                                                    <Image
                                                        src={p.heroImage}                // <-- use src, not href
                                                        alt={p.label ?? 'Product image'}
                                                        fill                              // fills the parent box
                                                        sizes="40px"
                                                        className="object-contain"        // show full image without cropping
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-10 w-10 rounded-lg bg-gray-100" />
                                            )}
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="truncate font-medium text-gray-900">{p.label}</span>
                                                    {p.category && (
                                                        <span className="rounded-md bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-700 ring-1 ring-inset ring-gray-200">
                                                            {p.category}
                                                        </span>
                                                    )}
                                                    {p.showInPlans ? (
                                                        <span className="rounded-md bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-700 ring-1 ring-inset ring-green-200">
                                                            Plans
                                                        </span>
                                                    ) : (
                                                        <span className="rounded-md bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 ring-1 ring-inset ring-gray-200">
                                                            Hidden
                                                        </span>
                                                    )}
                                                    {p.inStock ? (
                                                        <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                                                            In stock
                                                        </span>
                                                    ) : (
                                                        <span className="rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-700 ring-1 ring-inset ring-red-200">
                                                            Out
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                                                    <DollarSign className="h-3.5 w-3.5" />
                                                    <span className="truncate">{p.price}{p.unit ? ` ${p.unit}` : ''}</span>
                                                    {p.slug && <span className="truncate text-gray-400">• {p.slug}</span>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/dashboard/products/${encodeURIComponent(id)}`}
                                                className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                                                title="View details"
                                            >
                                                <Eye size={16} /> Details
                                            </Link>
                                            <Link
                                                href={`/dashboard/products/${encodeURIComponent(id)}/edit`}
                                                className="inline-flex items-center gap-1 rounded-md bg-secondary px-3 py-1.5 text-sm text-white hover:bg-secondary/90"
                                                title="Edit"
                                            >
                                                <Pencil size={16} /> Edit
                                            </Link>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}
function flattenProducts(result) {
    if (Array.isArray(result)) {
        return result.map(p => ({
            ...p,
            _id: p?._id ?? p?.id ?? buildCompositeId(p.category, p.slug),
        }));
    }
    const out = [];
    Object.entries(result || {}).forEach(([category, group]) => {
        Object.entries(group || {}).forEach(([slug, product]) => {
            out.push({
                _id: product?._id ?? product?.id ?? buildCompositeId(category, slug),
                category,
                slug,
                ...product,
            });
        });
    });
    return out;
}
function buildCompositeId(category, slug) {
    return `${(category || '').toString()}::${(slug || '').toString()}`;
}
function getProductId(p) {
    return p?._id ?? p?.id ?? buildCompositeId(p.category, p.slug);
}