'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Save, Trash2, GripVertical } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { Input } from '@/components/ui/input';

const PRESET = {
    semaglutide: { label: 'Semaglutide', image: '/pricing/semaglutide.png' },
    tirzepatide: { label: 'Tirzepatide', image: '/pricing/tirzepatide.png' },
};

const makeUID = () =>
    (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const EMPTY_OPTION = () => ({ uid: makeUID(), label: '', price: 0, link: '' });

const Section = React.memo(function Section({
    row,
    productKey,
    preset,
    q,
    onFilterChange,
    onAddOption,
    onRemoveOption,
    onChangeOption,
    onSaveOptions,
    onReorderOption,
    saving,
}) {
    const filtering = q.trim().length > 0;
    const options = row?.options || [];

    return (
        <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-3">
                    <img src={preset.image} alt={preset.label} className="h-10 w-10 object-contain" />
                    <div>
                        <div className="text-base font-semibold">{preset.label}</div>
                        <div className="text-xs text-gray-500">Key: {productKey}</div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onAddOption(productKey)}
                        className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
                    >
                        <Plus size={16} /> Add Option
                    </button>
                    <button
                        onClick={() => onSaveOptions(productKey)}
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-md bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700 disabled:opacity-60"
                    >
                        <Save size={16} /> {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="p-4">
                <div className="mb-3 flex items-center justify-between">
                    <div className="text-sm font-medium">
                        Dose Options <span className="text-gray-400">({options.length})</span>
                        {filtering && (
                            <span className="ml-2 text-xs text-gray-400">Dragging disabled while filtering.</span>
                        )}
                    </div>
                    <div className="relative">
                        <Input
                            value={q}
                            onChange={(e) => onFilterChange(e.target.value)}
                            placeholder="Filter options…"
                            className="h-9 w-56"
                        />
                        <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none">
                            <path d="M21 21l-4.3-4.3M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                </div>

                {!row || options.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500">
                        {row ? 'No options yet. Click Add Option.' : 'Product not created yet — click Add Option to create and start.'}
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {options.map((o) => {
                            const matches =
                                !q.trim() ||
                                (o.label || '').toLowerCase().includes(q.toLowerCase()) ||
                                String(o.price ?? '').includes(q);
                            if (!matches) return null;

                            return (
                                <li
                                    key={o.uid}
                                    // Drop target stays on the <li>
                                    onDragOver={(e) => {
                                        if (filtering) return;
                                        e.preventDefault();
                                        e.dataTransfer.dropEffect = 'move';
                                    }}
                                    onDrop={(e) => {
                                        if (filtering) return;
                                        e.preventDefault();
                                        const fromUid = e.dataTransfer.getData('text/plain');
                                        const toUid = o.uid;
                                        if (fromUid && toUid && fromUid !== toUid) {
                                            onReorderOption(productKey, fromUid, toUid);
                                        }
                                    }}
                                    className="border rounded p-3 hover:bg-gray-50"
                                >
                                    {/* Row layout with compact left handle */}
                                    <div className="flex items-start gap-3">
                                        {/* Drag handle (only this is draggable) */}
                                        <button
                                            type="button"
                                            draggable={!filtering}
                                            onDragStart={(e) => {
                                                if (filtering) return;
                                                e.dataTransfer.effectAllowed = 'move';
                                                e.dataTransfer.setData('text/plain', o.uid);
                                            }}
                                            className={`mt-1 h-7 w-7 shrink-0 inline-flex items-center justify-center rounded-full
                        ${filtering
                                                    ? 'cursor-not-allowed text-gray-300'
                                                    : 'cursor-grab text-gray-400 hover:text-gray-700 hover:bg-gray-100 active:cursor-grabbing'
                                                }`}
                                            title={filtering ? 'Clear filter to drag' : 'Drag to reorder'}
                                            aria-label="Drag option"
                                        >
                                            <GripVertical size={16} />
                                        </button>

                                        {/* Fields */}
                                        <div className="grid md:grid-cols-12 gap-3 flex-1">
                                            <label className="text-sm md:col-span-5">
                                                Label*
                                                <Input
                                                    className="mt-1"
                                                    placeholder="4 weeks (0.25mg/week)"
                                                    value={o.label}
                                                    onChange={(e) =>
                                                        onChangeOption(productKey, o.uid, 'label', e.target.value)
                                                    }
                                                />
                                            </label>

                                            <label className="text-sm md:col-span-2">
                                                Price*
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    className="mt-1"
                                                    placeholder="99"
                                                    value={o.price}
                                                    onChange={(e) =>
                                                        onChangeOption(productKey, o.uid, 'price', Number(e.target.value))
                                                    }
                                                />
                                            </label>

                                            <label className="text-sm md:col-span-4">
                                                Checkout link
                                                <Input
                                                    className="mt-1"
                                                    placeholder="https://buy.stripe.com/..."
                                                    value={o.link}
                                                    onChange={(e) =>
                                                        onChangeOption(productKey, o.uid, 'link', e.target.value)
                                                    }
                                                />
                                            </label>

                                            <div className="md:col-span-1 flex justify-end items-end">
                                                <button
                                                    onClick={() => onRemoveOption(productKey, o.uid)}
                                                    className="inline-flex items-center gap-1 rounded-md border px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 size={16} /> Remove
                                                </button>
                                            </div>
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
});

/* ----------------------------- PARENT ----------------------------- */
export default function PricingOptionsOnly() {
    const [rows, setRows] = useState([]); // [{ product, name, image, options:[{uid,label,price,link}] }]
    const [loading, setLoading] = useState(true);
    const [savingKey, setSavingKey] = useState(null);
    const [q, setQ] = useState('');

    const isPreset = useCallback((k) => k === 'semaglutide' || k === 'tirzepatide', []);
    const byKey = useCallback((k) => rows.find(r => r.product === k), [rows]);

    const attachUIDs = useCallback(
        (arr = []) =>
            arr.map(r => ({
                ...r,
                options: (r.options || []).map(o => (o.uid ? o : { ...o, uid: makeUID() })),
            })),
        []
    );

    async function load() {
        setLoading(true);
        try {
            const res = await fetch('/api/pricing', { cache: 'no-store' });
            const j = await res.json();
            if (!j?.success) throw new Error(j?.message || 'Load failed');
            const filtered = (j.result || []).filter(r => isPreset(r.product));
            setRows(attachUIDs(filtered));
        } catch (e) {
            console.error(e);
            toast.error('Failed to load pricing');
            setRows([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const ensureProductExists = useCallback(async (productKey) => {
        const exists = byKey(productKey);
        if (exists) return exists;
        try {
            const payload = {
                product: productKey,
                name: PRESET[productKey].label,
                image: PRESET[productKey].image,
                isActive: true,
                sortOrder: 0,
                options: [],
            };
            const res = await fetch('/api/pricing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const j = await res.json();
            if (!j?.success) throw new Error(j?.message || 'Create failed');
            await load();
            return byKey(productKey);
        } catch (e) {
            console.error(e);
            toast.error(e.message || 'Failed to create product');
            return null;
        }
    }, [byKey]);

    const handleOptionChange = useCallback((productKey, uid, field, value) => {
        setRows(prev => prev.map(r => {
            if (r.product !== productKey) return r;
            const opts = (r.options || []).map(o => (o.uid === uid ? { ...o, [field]: value } : o));
            return { ...r, options: opts };
        }));
    }, []);

    const addOption = useCallback((productKey) => {
        const row = byKey(productKey);
        if (!row) {
            ensureProductExists(productKey).then((created) => {
                if (!created) return;
                setRows(prev => prev.map(r =>
                    r.product === productKey ? { ...r, options: [...(r.options || []), EMPTY_OPTION()] } : r
                ));
            });
            return;
        }
        setRows(prev => prev.map(r =>
            r.product === productKey ? { ...r, options: [...(r.options || []), EMPTY_OPTION()] } : r
        ));
    }, [byKey, ensureProductExists]);

    const removeOption = useCallback((productKey, uid) => {
        setRows(prev => prev.map(r => {
            if (r.product !== productKey) return r;
            return { ...r, options: (r.options || []).filter(o => o.uid !== uid) };
        }));
    }, []);

    // Reorder by UID (drag & drop)
    const reorderOption = useCallback((productKey, fromUid, toUid) => {
        setRows(prev => prev.map(r => {
            if (r.product !== productKey) return r;
            const opts = [...(r.options || [])];
            const fromIndex = opts.findIndex(o => o.uid === fromUid);
            const toIndex = opts.findIndex(o => o.uid === toUid);
            if (fromIndex < 0 || toIndex < 0) return r;
            const [moved] = opts.splice(fromIndex, 1);
            opts.splice(toIndex, 0, moved);
            return { ...r, options: opts };
        }));
    }, []);

    const saveOptions = useCallback(async (productKey) => {
        const row = byKey(productKey) || await ensureProductExists(productKey);
        if (!row) return;

        setSavingKey(productKey);
        try {
            // Persist the current UI order as sortOrder
            const payload = {
                product: productKey,
                name: PRESET[productKey].label,
                image: PRESET[productKey].image,
                isActive: row.isActive ?? true,
                sortOrder: row.sortOrder ?? 0,
                options: (row.options || []).map((o, idx) => ({
                    label: String(o.label || '').trim(),
                    price: Number(o.price || 0),
                    link: String(o.link || '').trim(),
                    sortOrder: idx, // <<— keep the array order
                })).filter(o => o.label || o.link),
            };

            const res = await fetch(`/api/pricing/${encodeURIComponent(productKey)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const j = await res.json();
            if (!j?.success) throw new Error(j?.message || 'Update failed');
            toast.success('Options saved');
            await load();
        } catch (e) {
            console.error(e);
            toast.error(e.message || 'Failed to save options');
        } finally {
            setSavingKey(null);
        }
    }, [byKey, ensureProductExists]);

    return (
        <div className="w-full mx-auto px-4 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Pricing (Options Only)</h1>
                    <p className="text-gray-500 text-sm">Drag to reorder dose options (per product). Add, edit, remove, then Save.</p>
                </div>
            </div>

            {loading ? (
                <div className="rounded-2xl border bg-white p-6 text-sm text-gray-500">Loading…</div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    <Section
                        row={rows.find(r => r.product === 'semaglutide')}
                        productKey="semaglutide"
                        preset={PRESET.semaglutide}
                        q={q}
                        onFilterChange={setQ}
                        onAddOption={addOption}
                        onRemoveOption={removeOption}
                        onChangeOption={handleOptionChange}
                        onSaveOptions={saveOptions}
                        onReorderOption={reorderOption}
                        saving={savingKey === 'semaglutide'}
                    />
                    <Section
                        row={rows.find(r => r.product === 'tirzepatide')}
                        productKey="tirzepatide"
                        preset={PRESET.tirzepatide}
                        q={q}
                        onFilterChange={setQ}
                        onAddOption={addOption}
                        onRemoveOption={removeOption}
                        onChangeOption={handleOptionChange}
                        onSaveOptions={saveOptions}
                        onReorderOption={reorderOption}
                        saving={savingKey === 'tirzepatide'}
                    />
                </div>
            )}
        </div>
    );
}
