'use client';

import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { Plus, Pencil, Trash2, GripVertical, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const emptyDraft = (name) => ({
    _id: null,
    name, // idname
    sort: 0,
    label: '',
    price: '',
    link: '',
    paypal: '',
    isActive: true,
    // remaining field
    weekdes: '',
});

export default function PricingPayOptionsDashboard() {
    const [rows, setRows] = useState([]);    // from DB
    const [cats, setCats] = useState([]);    // [{idname,title,image}]
    const [loading, setLoading] = useState(true);
    const [catsLoading, setCatsLoading] = useState(true);

    // modal state
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [draft, setDraft] = useState(emptyDraft('semaglutide'));

    // drag state
    const dragRef = useRef({ name: null, id: null });
    const [savingOrderName, setSavingOrderName] = useState(null);

    const fetchCategories = useCallback(async () => {
        setCatsLoading(true);
        try {
            const r = await fetch('/api/plan-categories', { cache: 'no-store' });
            const j = await r.json();
            if (!j?.success) throw new Error(j?.message || 'Failed to load categories');
            setCats(j.result || []);
        } catch (e) {
            console.error(e);
            toast.error('Failed to load categories');
            setCats([]);
        } finally {
            setCatsLoading(false);
        }
    }, []);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const r = await fetch('/api/plan-pay-options', { cache: 'no-store' });
            const j = await r.json();
            if (!j?.success) throw new Error(j?.message || 'Load failed');
            setRows(j.result || []);
        } catch (e) {
            console.error(e);
            toast.error('Failed to load options');
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchCategories(); }, [fetchCategories]);
    useEffect(() => { fetchAll(); }, [fetchAll]);

    const grouped = useMemo(() => {
        const map = new Map();
        for (const c of cats) map.set(c.idname, []);
        for (const r of rows) {
            const key = String(r.name || '').toLowerCase();
            if (!map.has(key)) map.set(key, []); // unseen category but keep it
            map.get(key).push(r);
        }
        // sort inside each group
        for (const [k, arr] of map.entries()) {
            arr.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0) || (a.createdAt || '').localeCompare(b.createdAt || ''));
        }
        return map;
    }, [rows, cats]);

    function openCreateModal(name) {
        setDraft(emptyDraft(name));
        setOpen(true);
    }

    function openEditModal(row) {
        setDraft({
            _id: row._id,
            name: String(row.name || '').toLowerCase(),
            sort: Number(row.sort ?? 0),
            label: row.label || '',
            price: row.price || '',
            link: row.link || '',
            paypal: row.paypal || '',
            isActive: row.isActive !== false,
            weekdes: row.weekdes || '',
        });
        setOpen(true);
    }

    async function saveDraft() {
        if (!draft.name) {
            toast.error('Pick a category');
            return;
        }
        if (!draft.label.trim() || !draft.price.trim()) {
            toast.error('Label and price are required');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                name: draft.name, // idname
                sort: Number(draft.sort || 0),
                label: draft.label,
                price: draft.price,
                link: draft.link,
                paypal: draft.paypal,
                isActive: draft.isActive !== false,
                weekdes: String(draft.weekdes || ''),
            };

            if (!draft._id) {
                const res = await fetch('/api/plan-pay-options', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                const j = await res.json();
                if (!j?.success) throw new Error(j?.message || 'Create failed');
                toast.success('Created');
            } else {
                const res = await fetch(`/api/plan-pay-options/${encodeURIComponent(draft._id)}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                const j = await res.json();
                if (!j?.success) throw new Error(j?.message || 'Update failed');
                toast.success('Updated');
            }
            await fetchAll();
            setOpen(false);
        } catch (e) {
            console.error('Save error:', e);
            toast.error(e.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    }

    async function removeRow(id) {
        try {
            const r = await fetch(`/api/plan-pay-options/${encodeURIComponent(id)}`, { method: 'DELETE' });
            const j = await r.json();
            if (!j?.success) throw new Error(j?.message || 'Delete failed');
            toast.success('Deleted');
            setRows((prev) => prev.filter((p) => p._id !== id));
        } catch (e) {
            console.error(e);
            toast.error(e.message || 'Delete failed');
        }
    }

    function onDragStart(name, id, e) {
        dragRef.current = { name, id };
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(id));
        e.dataTransfer.setData('application/x-section', name);
    }
    function onDragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }

    async function onDrop(name, toIndex, e) {
        e.preventDefault();
        const dataId = e.dataTransfer.getData('text/plain');
        const dataName = e.dataTransfer.getData('application/x-section');
        const draggedId = dragRef.current.id || dataId;
        const draggedName = dragRef.current.name || dataName;

        if (!draggedId || draggedName !== name) {
            dragRef.current = { name: null, id: null };
            return;
        }

        const section = [...(grouped.get(name) || [])];
        const fromIndex = section.findIndex((x) => String(x._id) === String(draggedId));
        if (fromIndex === -1 || fromIndex === toIndex) {
            dragRef.current = { name: null, id: null };
            return;
        }

        const [moved] = section.splice(fromIndex, 1);
        const safeIndex = Math.max(0, Math.min(toIndex, section.length));
        section.splice(safeIndex, 0, moved);

        const resequenced = section.map((r, i) => ({ ...r, sort: i }));
        setRows((prev) => {
            const others = prev.filter((r) => String(r.name).toLowerCase() !== name);
            return [...others, ...resequenced];
        });

        dragRef.current = { name: null, id: null };

        try {
            setSavingOrderName(name);
            const updates = resequenced.map((r) => ({ _id: r._id, sort: r.sort }));
            const res = await fetch('/api/plan-pay-options', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ updates }),
            });
            const j = await res.json().catch(() => ({}));
            if (!res.ok || j?.success === false) throw new Error(j?.message || 'Failed to save order');
            toast.success('Order saved');
            await fetchAll();
        } catch (err) {
            console.error(err);
            toast.error('Failed to save order');
        } finally {
            setSavingOrderName(null);
        }
    }

    function Section({ cat }) {
        const name = cat.idname;
        const list = grouped.get(name) || [];
        return (
            <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b flex items-center justify-between bg-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="text-base font-semibold">{cat.title}</div>
                        {savingOrderName === name && <span className="text-xs text-gray-500">Saving order…</span>}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => openCreateModal(name)} className="gap-2">
                            <Plus size={16} /> Add
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="p-5 text-sm text-gray-500">Loading…</div>
                ) : list.length === 0 ? (
                    <div className="p-5 text-sm text-gray-500">No options yet.</div>
                ) : (
                    <div className="p-2 md:p-4">
                        <div className="hidden md:grid px-3 py-2 text-xs text-gray-500 [grid-template-columns:28px_minmax(0,1fr)_110px_minmax(0,1fr)_220px]">
                            <div />
                            <div>Label</div>
                            <div>Price</div>
                            <div>Links</div>
                            <div className="text-right">Actions</div>
                        </div>

                        <ul className="space-y-2">
                            {list.map((r, idx) => (
                                <li
                                    key={r._id}
                                    onDragOver={onDragOver}
                                    onDrop={(e) => onDrop(name, idx, e)}
                                    className="rounded border bg-white"
                                >
                                    <div
                                        className={cn(
                                            'px-3 py-3 grid gap-2',
                                            'grid-cols-1 md:[grid-template-columns:28px_minmax(0,1fr)_110px_minmax(0,1fr)_220px] md:items-center'
                                        )}
                                        onDragOver={onDragOver}
                                        onDrop={(e) => onDrop(name, idx, e)}
                                    >
                                        <div className="flex md:block">
                                            <button
                                                type="button"
                                                title="Drag to reorder"
                                                aria-label="Drag handle"
                                                draggable
                                                onDragStart={(e) => onDragStart(name, r._id, e)}
                                                className={cn(
                                                    'h-7 w-7 rounded-md text-gray-400 hover:text-gray-600',
                                                    'flex items-center justify-center hover:bg-gray-50 active:bg-gray-100',
                                                    'cursor-grab active:cursor-grabbing'
                                                )}
                                            >
                                                <GripVertical size={16} />
                                            </button>
                                        </div>

                                        <div className="min-w-0">
                                            <div className="md:hidden text-[11px] text-gray-500 mb-1">Label</div>
                                            <div className="truncate text-sm font-medium text-gray-800">{r.label}</div>

                                            {/* Week description directly below label */}
                                            {r.weekdes ? (
                                                <div className="text-xs text-gray-600 mt-0.5 break-words">{r.weekdes}</div>
                                            ) : null}

                                            {/* metadata preview on mobile */}
                                            <div className="md:hidden mt-2 space-y-1">
                                                <div className="text-xs text-gray-700">
                                                    <span className="font-medium">{r.price}</span>
                                                </div>

                                                <div className="text-[11px] text-gray-600 leading-4">
                                                    <div className="truncate">
                                                        <span className="text-gray-500">Stripe link:</span>{' '}
                                                        {r.link ? (
                                                            <a
                                                                href={r.link}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="underline break-all"
                                                            >
                                                                {r.link}
                                                            </a>
                                                        ) : (
                                                            <span className="text-gray-400">—</span>
                                                        )}
                                                    </div>
                                                    <div className="truncate">
                                                        <span className="text-gray-500">PayPal link:</span>{' '}
                                                        {r.paypal ? (
                                                            <a
                                                                href={r.paypal}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="underline break-all"
                                                            >
                                                                {r.paypal}
                                                            </a>
                                                        ) : (
                                                            <span className="text-gray-400">—</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Price column */}
                                        <div className="hidden md:block text-sm">
                                            <div className="font-medium">{r.price}</div>
                                        </div>

                                        {/* Links column */}
                                        <div className="hidden md:block min-w-0">
                                            <div className="text-xs text-gray-700 space-y-0.5">
                                                <div className="truncate">
                                                    <span className="text-gray-500">Stripe link:</span>{' '}
                                                    {r.link ? (
                                                        <a
                                                            href={r.link}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="underline truncate inline-block max-w-full align-top"
                                                        >
                                                            {r.link}
                                                        </a>
                                                    ) : (
                                                        <span className="text-gray-400">—</span>
                                                    )}
                                                </div>
                                                <div className="truncate">
                                                    <span className="text-gray-500">PayPal link:</span>{' '}
                                                    {r.paypal ? (
                                                        <a
                                                            href={r.paypal}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="underline truncate inline-block max-w-full align-top"
                                                        >
                                                            {r.paypal}
                                                        </a>
                                                    ) : (
                                                        <span className="text-gray-400">—</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="md:ml-auto">
                                            <div className="flex gap-2 flex-wrap md:flex-nowrap md:justify-end w-full whitespace-nowrap">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="text-white gap-1 px-2.5"
                                                    onClick={() => openEditModal(r)}
                                                >
                                                    <Pencil size={16} /> Edit
                                                </Button>

                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="gap-1 px-2.5 text-red-600 border-red-200 hover:bg-red-50"
                                                        >
                                                            <Trash2 size={16} /> Delete
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete this option?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                className="bg-red-600 hover:bg-red-700"
                                                                onClick={() => removeRow(r._id)}
                                                            >
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                            <li
                                onDragOver={onDragOver}
                                onDrop={(e) => onDrop(name, (grouped.get(name) || []).length, e)}
                                className="h-4"
                                aria-hidden
                            />
                        </ul>

                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="w-full mx-auto px-4 pb-4 space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Pricing – Pay Options</h1>
                <p className="text-gray-500 text-sm">
                    Add, edit, delete, and drag to sort options across all categories. Supports week descriptions.
                </p>
            </div>

            {/* Render a Section per category */}
            {catsLoading ? (
                <div className="p-5 text-sm text-gray-500">Loading categories…</div>
            ) : cats.length === 0 ? (
                <div className="p-5 text-sm text-gray-500">No categories found. Configure Pricing Landing options.</div>
            ) : (
                cats
                    .filter((cat) => cat.title.toLowerCase() !== 'weight loss' && cat.idname.toLowerCase() !== 'weight-loss')
                    .map((cat) => <Section key={cat.idname} cat={cat} />)
            )}

            {/* Add/Edit Modal */}
            <Dialog open={open} onOpenChange={(v) => !saving && setOpen(v)}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{draft._id ? 'Edit Option' : 'Add Option'}</DialogTitle>
                        <DialogDescription>Choose category and fill details.</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-2">
                        {/* Category select */}
                        <div>
                            <Label className="text-xs">Category*</Label>
                            <Select
                                value={draft.name || ''}
                                onValueChange={(value) => setDraft((d) => ({ ...d, name: value }))}
                            >
                                <SelectTrigger className="w-full mt-1">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {cats
                                        .filter(
                                            (c) =>
                                                c.title.toLowerCase() !== 'weight loss' &&
                                                c.idname.toLowerCase() !== 'weight-loss'
                                        )
                                        .map((c) => (
                                            <SelectItem key={c.idname} value={c.idname}>
                                                {c.title}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">
                                <Label className="text-xs">Price*</Label>
                                <Input
                                    type="text"
                                    placeholder="$0"
                                    value={draft.price || ''}
                                    onChange={(e) => {
                                        let val = e.target.value.replace(/[^\d]/g, ''); // digits only
                                        if (val) val = `$${val}`;
                                        setDraft((d) => ({ ...d, price: val }));
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <Label className="text-xs">Label*</Label>
                            <Input
                                placeholder="e.g., 8 Weeks (0.25mg and 0.5mg/week)"
                                value={draft.label}
                                onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
                                className="mt-1"
                            />
                        </div>
                        {/* Week description */}
                        <div>
                            <Label className="text-xs">Week description</Label>
                            <Input
                                placeholder='e.g., "For 12 weeks"'
                                className="mt-1"
                                value={draft.weekdes}
                                onChange={(e) => setDraft((d) => ({ ...d, weekdes: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Label className="text-xs">Stripe link</Label>
                            <Input
                                placeholder="https://buy.stripe.com/..."
                                value={draft.link}
                                onChange={(e) => setDraft((d) => ({ ...d, link: e.target.value }))}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label className="text-xs">PayPal link</Label>
                            <Input
                                placeholder="https://www.paypal.com/ncp/payment/..."
                                value={draft.paypal}
                                onChange={(e) => setDraft((d) => ({ ...d, paypal: e.target.value }))}
                                className="mt-1"
                            />
                        </div>


                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
                        <Button className={cn('gap-2')} onClick={saveDraft} disabled={saving}>
                            <Save size={16} /> {saving ? 'Saving…' : 'Save'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
