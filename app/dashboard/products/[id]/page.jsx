'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Pencil, DollarSign, Package, Star } from 'lucide-react';
import { Trash } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ProductDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const routeId = decodeURIComponent(String(Array.isArray(params?.id) ? params.id[0] : params?.id || ''));
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const p = await resolveProductByAnyKey(routeId);
            if (!p) throw new Error("Not found");

            setProduct(p);
        } catch (e) {
            console.error(e);
            router.push("/dashboard/products");
        } finally {
            setLoading(false);
        }
    }, [routeId, router]);
    // ↑ dependencies used inside load()


    useEffect(() => {
        load();
    }, [load]);
    async function onDelete() {
        if (!confirm('Delete this product?')) return;
        try {
            const idForDelete = product?._id || product?.id || (product?.category && product?.slug ? `${product.category}::${product.slug}` : routeId);
            const res = await fetch(`/api/products?id=${encodeURIComponent(idForDelete)}`, { method: 'DELETE' });
            const j = await res.json();
            if (!j?.success) throw new Error(j?.message || 'Delete failed');
            router.push('/dashboard/products');
        } catch (e) {
            console.error(e);
            alert('Error deleting product.');
        }
    }

    if (loading) return <div className="p-6">Loading…</div>;
    if (!product) return null;

    // Keep using the same route id for links so URLs remain consistent
    const paramForLinks = routeId;

    return (
        <div className="w-full mx-auto p-6">
            <div className="mb-6 flex items-center justify-between">
                <Link href="/dashboard/products" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800">
                    <ArrowLeft size={16} /> Back
                </Link>
                <div className="flex items-center gap-2">
                    <Link
                        href={`/dashboard/products/${encodeURIComponent(paramForLinks)}/edit`}
                        className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-white hover:bg-secondary/90"
                    >
                        <Pencil size={16} /> Edit
                    </Link>
                    <button
                        onClick={onDelete}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-red-700 hover:bg-red-100"
                    >
                        <Trash size={16} /> Delete
                    </button>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="grid gap-6 md:grid-cols-3 p-6">
                    {/* Image */}
                    <div className="md:col-span-1">
                        {product.heroImage ? (
                            <div className="relative w-full aspect-square overflow-hidden rounded-xl bg-white">
                                <Image
                                    src={product.heroImage}
                                    alt={product.label ?? 'Product image'}
                                    fill
                                    sizes="(min-width: 768px) 33vw, 100vw"
                                    className="object-contain"   // <-- show full image without cropping
                                />
                            </div>
                        ) : (
                            <div className="w-full aspect-square rounded-xl bg-gray-100" />
                        )}
                    </div>

                    {/* Summary */}
                    <div className="md:col-span-2">
                        <h1 className="text-2xl font-semibold text-gray-900">{product.label}</h1>
                        {product.shortLabel && <p className="mt-1 text-gray-600">{product.shortLabel}</p>}

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            {product.category && (
                                <span className="rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-200">
                                    {product.category}
                                </span>
                            )}
                            {product.showInPlans ? (
                                <span className="rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-200">Shown in Plans</span>
                            ) : (
                                <span className="rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-200">Hidden</span>
                            )}
                            {product.inStock ? (
                                <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">In Stock</span>
                            ) : (
                                <span className="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-200">Out of Stock</span>
                            )}
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                            <div className="flex items-center gap-2 text-gray-800">
                                <DollarSign className="h-4 w-4 text-emerald-600" />
                                <span className="font-medium">{product.price}{product.unit ? ` ${product.unit}` : ''}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <Package className="h-4 w-4 text-blue-600" />
                                <span className="truncate">Slug: {product.slug}</span>
                            </div>
                            {product.ratingLabel && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Star className="h-4 w-4 text-yellow-600" />
                                    <span>{product.ratingLabel}</span>
                                </div>
                            )}
                        </div>

                        {product.description && (
                            <div className="mt-5">
                                <h3 className="text-sm font-medium text-gray-900">Description</h3>
                                <p className="mt-1 text-sm text-gray-700">{product.description}</p>
                            </div>
                        )}

                        {!!(product.bullets?.length) && (
                            <div className="mt-5">
                                <h3 className="text-sm font-medium text-gray-900">Key Features</h3>
                                <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                                    {product.bullets.map((b, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                                            <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                                            {b?.text}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ---------------- utils (drop in) ---------------- */
async function resolveProductByAnyKey(param) {
    const id = decodeURIComponent(String(param || ''));

    // 1) Try direct by id
    try {
        const r = await fetch(`/api/products?id=${encodeURIComponent(id)}`, { cache: 'no-store' });
        const j = await r.json();
        if (j?.success && j?.result) {
            const found = pickFromResult(j.result, id);
            if (found) return found;
        }
    } catch { }

    // 2) If param looks like category::slug, search by those
    if (id.includes('::')) {
        const [category, slug] = id.split('::');
        const p = await findInAll((x) => x.category === category && x.slug === slug);
        if (p) return p;
    }

    // 3) Fallback: scan all and match by _id | id | slug
    return findInAll((x) => x._id === id || x.id === id || x.slug === id);
}

async function findInAll(predicate) {
    try {
        const all = await fetch('/api/products', { cache: 'no-store' }).then((r) => r.json());
        const flat = toFlatArray(all?.result);
        return flat.find(predicate) || null;
    } catch {
        return null;
    }
}

function toFlatArray(result) {
    if (!result) return [];
    if (Array.isArray(result)) return result;
    const out = [];
    Object.entries(result).forEach(([category, group]) => {
        Object.entries(group || {}).forEach(([slug, product]) => {
            out.push({ _id: product?._id, id: product?.id, category, slug, ...product });
        });
    });
    return out;
}

function pickFromResult(result, wantedId) {
    // single object?
    if (result && typeof result === 'object' && !Array.isArray(result) && (result._id || result.id)) return result;

    // array
    if (Array.isArray(result)) {
        return result.find((p) => p._id === wantedId || p.id === wantedId || p.slug === wantedId) || null;
    }

    // grouped map { category: { slug: product } }
    if (typeof result === 'object' && result) {
        for (const [category, group] of Object.entries(result)) {
            for (const [slug, product] of Object.entries(group || {})) {
                if (product?._id === wantedId || product?.id === wantedId || slug === wantedId) {
                    return { category, slug, ...product };
                }
            }
        }
    }
    return null;
}
