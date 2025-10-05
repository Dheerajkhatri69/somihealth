'use client';

import { useEffect, useState } from 'react';
import * as Lucide from 'lucide-react';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

// shadcn/ui Select
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';

const ICON_OPTIONS = [
    'Handshake', 'CreditCard', 'Stethoscope', 'Shield', 'ShieldCheck', 'Heart', 'Star', 'Award',
    'Users', 'Clock', 'TrendingUp', 'Target', 'Rocket', 'Globe', 'Gift', 'DollarSign', 'Calendar', 'Zap', 'Check',
];

export default function HeroTextEditorPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        mainTitle: '',
        rotatingLines: [''],
        features: [{ icon: 'Handshake', text: '', sortOrder: 0 }],
    });

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const r = await fetch('/api/hero-text', { cache: 'no-store' });
                const j = await r.json();
                if (j?.success && j?.result) {
                    const d = j.result;
                    setForm({
                        mainTitle: d.mainTitle || '',
                        rotatingLines:
                            Array.isArray(d.rotatingLines) && d.rotatingLines.length
                                ? d.rotatingLines
                                : [''],
                        features:
                            Array.isArray(d.features) && d.features.length
                                ? d.features.sort(
                                    (a, b) => (a?.sortOrder ?? 0) - (b?.sortOrder ?? 0)
                                )
                                : [{ icon: 'Handshake', text: '', sortOrder: 0 }],
                    });
                }
            } catch (e) {
                console.error(e);
                toast.error('Failed to load hero text.');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const updateLine = (idx, val) => {
        setForm((prev) => ({
            ...prev,
            rotatingLines: prev.rotatingLines.map((s, i) => (i === idx ? val : s)),
        }));
    };
    const addLine = () =>
        setForm((prev) => ({
            ...prev,
            rotatingLines: [...prev.rotatingLines, ''],
        }));
    const removeLine = (idx) =>
        setForm((prev) => ({
            ...prev,
            rotatingLines: prev.rotatingLines.filter((_, i) => i !== idx),
        }));

    const updateFeature = (idx, patch) => {
        setForm((prev) => ({
            ...prev,
            features: prev.features.map((f, i) => (i === idx ? { ...f, ...patch } : f)),
        }));
    };
    const addFeature = () =>
        setForm((prev) => ({
            ...prev,
            features: [
                ...prev.features,
                { icon: 'Handshake', text: '', sortOrder: prev.features.length },
            ],
        }));
    const removeFeature = (idx) =>
        setForm((prev) => ({
            ...prev,
            features: prev.features
                .filter((_, i) => i !== idx)
                .map((f, i2) => ({ ...f, sortOrder: i2 })),
        }));

    const save = async () => {
        // simple client-side validation
        const cleanedLines = form.rotatingLines.map((s) => s.trim()).filter(Boolean);
        const cleanedFeatures = form.features
            .map((f, i) => ({
                icon: f.icon || 'Handshake',
                text: (f.text || '').trim(),
                sortOrder: i,
            }))
            .filter((f) => f.text);

        if (!form.mainTitle.trim()) {
            toast.error('Main title is required.');
            return;
        }
        if (cleanedLines.length === 0) {
            toast.error('Add at least one rotating line.');
            return;
        }

        setSaving(true);
        try {
            const body = {
                mainTitle: form.mainTitle.trim(),
                rotatingLines: cleanedLines,
                features: cleanedFeatures,
                isActive: true, // create a fresh active snapshot
            };

            const r = await fetch('/api/hero-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const j = await r.json();
            if (!j?.success) throw new Error(j?.message || 'Save failed');

            toast.success('Hero text saved!');
        } catch (e) {
            toast.error(e.message || 'Error while saving.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-4 md:p-6">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Edit Hero Text</h1>
                    <p className="text-sm text-gray-500">
                        Update the main title, rotating lines, and features.
                    </p>
                </div>

                <div className="flex gap-2">
                    <Link
                        href="/dashboard/websitehome"
                        className="rounded-lg bg-gray-600 px-3 py-2 text-white hover:bg-gray-700 inline-flex items-center gap-2"
                    >
                        <X size={16} />
                        Close
                    </Link>
                    <button
                        onClick={save}
                        disabled={saving}
                        className="rounded-lg bg-green-600 px-3 py-2 text-white hover:bg-green-700 inline-flex items-center gap-2 disabled:opacity-60"
                    >
                        <Save size={16} />
                        {saving ? 'Saving…' : 'Save'}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="space-y-3">
                    <div className="h-6 w-1/2 bg-gray-200 rounded animate-pulse" />
                    <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-40 w-full bg-gray-200 rounded animate-pulse" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Main title + Rotating lines */}
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Main Title
                            </label>
                            <input
                                value={form.mainTitle}
                                onChange={(e) =>
                                    setForm((prev) => ({ ...prev, mainTitle: e.target.value }))
                                }
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Look Better, Feel Better, Live Better."
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Rotating Lines ({form.rotatingLines.length})
                                </label>
                                <button
                                    onClick={addLine}
                                    className="text-sm text-blue-600 hover:text-blue-700"
                                >
                                    + Add Line
                                </button>
                            </div>
                            <div className="space-y-2">
                                {form.rotatingLines.map((s, i) => (
                                    <div key={i} className="flex gap-2">
                                        <input
                                            value={s}
                                            onChange={(e) => updateLine(i, e.target.value)}
                                            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder={`Rotating line ${i + 1}`}
                                        />
                                        {form.rotatingLines.length > 1 && (
                                            <button
                                                onClick={() => removeLine(i)}
                                                className="rounded-md bg-red-100 p-2 text-red-600 hover:bg-red-200"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-medium text-gray-700">
                                Features ({form.features.length})
                            </h2>
                            <button
                                onClick={addFeature}
                                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                            >
                                <Plus size={16} /> Add Feature
                            </button>
                        </div>

                        <div className="space-y-3">
                            {form.features.map((f, i) => {
                                const Icon = Lucide[f.icon] || Lucide.Stethoscope;
                                return (
                                    <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-900">
                                                Feature #{i + 1}
                                            </span>
                                            <button
                                                onClick={() => removeFeature(i)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                            <div className="md:col-span-1">
                                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                                    Icon
                                                </label>

                                                {/* shadcn Select */}
                                                <Select
                                                    value={f.icon}
                                                    onValueChange={(val) =>
                                                        updateFeature(i, { icon: val })
                                                    }
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue
                                                            placeholder="Select an icon"
                                                            // show icon preview in the trigger
                                                            renderValue={(val) => {
                                                                const I = Lucide[val] || Lucide.Stethoscope;
                                                                return (
                                                                    <div className="flex items-center gap-2">
                                                                        <I className="h-4 w-4" />
                                                                        <span>{val}</span>
                                                                    </div>
                                                                );
                                                            }}
                                                        />
                                                    </SelectTrigger>
                                                    <SelectContent className="max-h-72">
                                                        {ICON_OPTIONS.map((name) => {
                                                            const Ico = Lucide[name];
                                                            return (
                                                                <SelectItem key={name} value={name}>
                                                                    <div className="flex items-center gap-2">
                                                                        {Ico && <Ico className="h-4 w-4" />}
                                                                        <span>{name}</span>
                                                                    </div>
                                                                </SelectItem>
                                                            );
                                                        })}
                                                    </SelectContent>
                                                </Select>

                                                <div className="mt-2 text-gray-600 flex items-center gap-2">
                                                    <Icon className="h-5 w-5" />
                                                    <span className="text-xs">{f.icon}</span>
                                                </div>
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                                    Text
                                                </label>
                                                <input
                                                    value={f.text}
                                                    onChange={(e) =>
                                                        updateFeature(i, { text: e.target.value })
                                                    }
                                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="e.g., No insurance required"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
