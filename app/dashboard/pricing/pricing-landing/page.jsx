'use client';

import { useEffect, useState } from 'react';
import { Save, X, Plus, Trash2, Settings } from 'lucide-react';
import UploadMediaLite from '@/components/UploadMediaLite';

export default function PricingLandingDashboard() {
    const [content, setContent] = useState(null);
    const [editing, setEditing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const fetchContent = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/pricing-landing-content', { cache: 'no-store' });
            const data = await res.json();
            if (data.success) {
                setContent(data.result);
                setEditing(data.result);
            }
        } catch (e) {
            console.error('Fetch pricing landing failed', e);
        } finally {
            setLoading(false);
        }
    };

    const saveContent = async () => {
        try {
            const res = await fetch('/api/pricing-landing-content', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editing),
            });
            const data = await res.json();
            if (data.success) {
                setContent(data.result);
                setEditing(data.result);
                setIsEditing(false);
            }
        } catch (e) {
            console.error('Save pricing landing failed', e);
        }
    };

    useEffect(() => {
        fetchContent();
    }, []);

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse h-10 w-64 bg-gray-200 rounded mb-4"></div>
                <div className="animate-pulse h-6 w-80 bg-gray-200 rounded mb-2"></div>
                <div className="animate-pulse h-6 w-96 bg-gray-200 rounded"></div>
            </div>
        );
    }

    if (!editing) return <div className="p-6">No data.</div>;

    const update = (key, value) => setEditing((prev) => (prev ? { ...prev, [key]: value } : prev));

    return (
        <div className="p-6 w-full mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Pricing Landing — Management</h1>
                    <p className="text-gray-600 mt-2">Edit the content powering your “primary health goal” page.</p>
                </div>
                <button
                    onClick={() => setIsEditing((v) => !v)}
                    className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                    <Settings className="w-4 h-4" />
                    {isEditing ? 'Cancel' : 'Edit'}
                </button>
            </div>

            {/* Header & Meta */}
            <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold">Header & Meta</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['brand', 'backLabel', 'backUrl', 'title', 'subtitle', 'payLaterPrefix'].map((k) => (
                        <div key={k}>
                            <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">{k}</label>
                            <input
                                type="text"
                                disabled={!isEditing}
                                value={(editing?.[k]) || ''}
                                onChange={(e) => update(k, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            />
                        </div>
                    ))}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Refund Copy</label>
                        <textarea
                            rows={3}
                            disabled={!isEditing}
                            value={editing.refundCopy}
                            onChange={(e) => update('refundCopy', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                    </div>
                </div>
            </div>

            {/* Guarantee Lines */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Guarantee Lines</h2>
                    {isEditing && (
                        <button
                            onClick={() => update('guaranteeLines', [...(editing.guaranteeLines || []), 'New line'])}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
                        >
                            <Plus className="w-4 h-4" /> Add Line
                        </button>
                    )}
                </div>
                <div className="p-6 space-y-3">
                    {(editing.guaranteeLines || []).map((line, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <input
                                type="text"
                                disabled={!isEditing}
                                value={line}
                                onChange={(e) => {
                                    const next = [...editing.guaranteeLines];
                                    next[idx] = e.target.value;
                                    update('guaranteeLines', next);
                                }}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            />
                            {isEditing && (
                                <button
                                    onClick={() =>
                                        update('guaranteeLines', editing.guaranteeLines.filter((_, i) => i !== idx))
                                    }
                                    className="p-2 rounded bg-red-50 text-red-600 hover:bg-red-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Pay Logos */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Pay Logos</h2>
                    {isEditing && (
                        <button
                            onClick={() => update('payLogos', [...(editing.payLogos || []), { src: '', alt: '' }])}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
                        >
                            <Plus className="w-4 h-4" /> Add Logo
                        </button>
                    )}
                </div>
                <div className="p-6 space-y-4">
                    {(editing.payLogos || []).map((logo, idx) => (
                        <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Logo Image</label>
                                <UploadMediaLite
                                    file={logo.src}
                                    onUploadComplete={(url) => {
                                        const next = [...editing.payLogos];
                                        next[idx].src = url;
                                        update('payLogos', next);
                                    }}
                                    onDelete={() => {
                                        const next = [...editing.payLogos];
                                        next[idx].src = '';
                                        update('payLogos', next);
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Alt</label>
                                <input
                                    type="text"
                                    disabled={!isEditing}
                                    value={logo.alt}
                                    onChange={(e) => {
                                        const next = [...editing.payLogos];
                                        next[idx].alt = e.target.value;
                                        update('payLogos', next);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                            </div>
                            {isEditing && (
                                <div className="flex items-end">
                                    <button
                                        onClick={() =>
                                            update('payLogos', editing.payLogos.filter((_, i) => i !== idx))
                                        }
                                        className="p-2 rounded bg-red-50 text-red-600 hover:bg-red-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Badges */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Badges</h2>
                    {isEditing && (
                        <button
                            onClick={() => update('badges', [...(editing.badges || []), { src: '', alt: '', w: 96, h: 96 }])}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
                        >
                            <Plus className="w-4 h-4" /> Add Badge
                        </button>
                    )}
                </div>
                <div className="p-6 space-y-4">
                    {(editing.badges || []).map((b, idx) => (
                        <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Badge Image</label>
                                <UploadMediaLite
                                    file={b.src}
                                    onUploadComplete={(url) => {
                                        const next = [...editing.badges];
                                        next[idx].src = url;
                                        update('badges', next);
                                    }}
                                    onDelete={() => {
                                        const next = [...editing.badges];
                                        next[idx].src = '';
                                        update('badges', next);
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Alt</label>
                                <input
                                    type="text"
                                    disabled={!isEditing}
                                    value={b.alt}
                                    onChange={(e) => {
                                        const next = [...editing.badges];
                                        next[idx].alt = e.target.value;
                                        update('badges', next);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Width</label>
                                <input
                                    type="number"
                                    disabled={!isEditing}
                                    value={b.w}
                                    onChange={(e) => {
                                        const next = [...editing.badges];
                                        next[idx].w = Number(e.target.value || 0);
                                        update('badges', next);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
                                <input
                                    type="number"
                                    disabled={!isEditing}
                                    value={b.h}
                                    onChange={(e) => {
                                        const next = [...editing.badges];
                                        next[idx].h = Number(e.target.value || 0);
                                        update('badges', next);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                            </div>
                            {isEditing && (
                                <div className="md:col-span-5">
                                    <button
                                        onClick={() =>
                                            update('badges', editing.badges.filter((_, i) => i !== idx))
                                        }
                                        className="p-2 rounded bg-red-50 text-red-600 hover:bg-red-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Options */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Options (cards)</h2>
                    {isEditing && (
                        <button
                            onClick={() =>
                                update('options', [
                                    ...(editing.options || []),
                                    { title: 'New Plan', idname: 'newplan', price: { note: 'AS LOW AS', amount: 0, unit: '/mo' }, href: '/pricing/newplan', image: '' },
                                ])
                            }
                            className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
                        >
                            <Plus className="w-4 h-4" /> Add Option
                        </button>
                    )}
                </div>
                <div className="p-6 space-y-6">
                    {(editing.options || []).map((opt, idx) => (
                        <div key={idx} className="border border-gray-200 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                                    <input
                                        type="text"
                                        disabled={!isEditing}
                                        value={opt.title}
                                        onChange={(e) => {
                                            const next = [...editing.options];
                                            next[idx].title = e.target.value;
                                            update('options', next);
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">ID Name (slug-ish)</label>
                                    <input
                                        type="text"
                                        disabled={!isEditing}
                                        value={opt.idname}
                                        onChange={(e) => {
                                            const next = [...editing.options];
                                            next[idx].idname = e.target.value;
                                            update('options', next);
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Href</label>
                                    <input
                                        type="text"
                                        disabled={!isEditing}
                                        value={opt.href}
                                        onChange={(e) => {
                                            const next = [...editing.options];
                                            next[idx].href = e.target.value;
                                            update('options', next);
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Card Image</label>
                                    <UploadMediaLite
                                        file={opt.image}
                                        onUploadComplete={(url) => {
                                            const next = [...editing.options];
                                            next[idx].image = url;
                                            update('options', next);
                                        }}
                                        onDelete={() => {
                                            const next = [...editing.options];
                                            next[idx].image = '';
                                            update('options', next);
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Price Note</label>
                                    <input
                                        type="text"
                                        disabled={!isEditing}
                                        value={opt.price?.note || ''}
                                        onChange={(e) => {
                                            const next = [...editing.options];
                                            next[idx].price = { ...(opt.price || {}), note: e.target.value };
                                            update('options', next);
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Price Amount</label>
                                    <input
                                        type="number"
                                        disabled={!isEditing}
                                        value={opt.price?.amount ?? 0}
                                        onChange={(e) => {
                                            const next = [...editing.options];
                                            next[idx].price = { ...(opt.price || {}), amount: Number(e.target.value || 0) };
                                            update('options', next);
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Price Unit</label>
                                    <input
                                        type="text"
                                        disabled={!isEditing}
                                        value={opt.price?.unit || ''}
                                        onChange={(e) => {
                                            const next = [...editing.options];
                                            next[idx].price = { ...(opt.price || {}), unit: e.target.value };
                                            update('options', next);
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                    />
                                </div>
                            </div>
                            {/* Banner Behind Settings */}
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Banner Text
                                    </label>
                                    <input
                                        type="text"
                                        disabled={!isEditing}
                                        value={opt.bannerBehind || ''}
                                        onChange={(e) => {
                                            const next = [...editing.options];
                                            next[idx].bannerBehind = e.target.value;
                                            update('options', next);
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Show Banner?
                                    </label>
                                    <select
                                        disabled={!isEditing}
                                        value={opt.bannerBehindShow ? 'true' : 'false'}
                                        onChange={(e) => {
                                            const next = [...editing.options];
                                            next[idx].bannerBehindShow = e.target.value === 'true';
                                            update('options', next);
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                    >
                                        <option value="false">No</option>
                                        <option value="true">Yes</option>
                                    </select>
                                </div>
                            </div>

                            {isEditing && (
                                <div className="mt-4">
                                    <button
                                        onClick={() => update('options', editing.options.filter((_, i) => i !== idx))}
                                        className="inline-flex items-center gap-2 p-2 rounded bg-red-50 text-red-600 hover:bg-red-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Remove Option
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-6">
                <button
                    onClick={saveContent}
                    disabled={!isEditing}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    Save
                </button>
                <button
                    onClick={() => {
                        setIsEditing(false);
                        setEditing(content);
                    }}
                    disabled={!isEditing}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                >
                    <X className="w-4 h-4" />
                    Cancel
                </button>
            </div>

            <div className="mt-6 text-sm text-gray-600">
                This data powers your pricing-landing page.
            </div>
        </div>
    );
}