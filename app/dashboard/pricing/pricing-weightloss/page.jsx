"use client";
import { useState, useEffect } from "react";
import { Save, X, Plus, Trash2, Settings } from 'lucide-react';
import UploadMediaLite from '@/components/UploadMediaLite';

export default function AdminWeightLossPage() {
    const [content, setContent] = useState(null);
    const [editing, setEditing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const fetchContent = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/pricing-weightloss-content', { cache: 'no-store' });
            const data = await res.json();
            if (data.success) {
                setContent(data.result);
                setEditing(data.result);
            }
        } catch (e) {
            console.error('Fetch weight loss content failed', e);
        } finally {
            setLoading(false);
        }
    };

    const saveContent = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/pricing-weightloss-content', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editing),
            });
            const data = await res.json();
            if (data.success) {
                setContent(data.result);
                setEditing(data.result);
                setIsEditing(false);
                setMessage('Updated successfully');
            }
        } catch (e) {
            console.error('Save weight loss content failed', e);
            setMessage('Failed to update content');
        } finally {
            setSaving(false);
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
    const updateGuarantee = (key, value) => setEditing((prev) => (prev ? {
        ...prev,
        guarantee: { ...prev.guarantee, [key]: value }
    } : prev));

    return (
        <div className="p-6 w-full mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Weight Loss Pricing — Management</h1>
                    <p className="text-gray-600 mt-2">Edit the content powering your weight loss pricing page.</p>
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
                    {['heading', 'subheading', 'brand', 'backLabel', 'backHref'].map((k) => (
                        <div key={k}>
                            <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                                {k === 'backHref' ? 'Back URL' : k}
                            </label>
                            <input
                                type="text"
                                disabled={!isEditing}
                                value={editing?.[k] || ''}
                                onChange={(e) => update(k, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Options */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Pricing Options</h2>
                    {isEditing && (
                        <button
                            onClick={() => update('options', [
                                ...(editing.options || []),
                                {
                                    title: 'New Option',
                                    idname: 'new-option',
                                    price: { note: '', amount: 0, unit: '' },
                                    href: '#',
                                    image: ''
                                }
                            ])}
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Title*</label>
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">ID Name*</label>
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
                                        placeholder="e.g., semaglutide, tirzepatide"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Link</label>
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
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
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

                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Banner Text</label>
                                        <input
                                            type="text"
                                            disabled={!isEditing}
                                            value={opt.bannerBehind || ''}
                                            onChange={(e) => {
                                                const next = [...editing.options];
                                                next[idx].bannerBehind = e.target.value;
                                                update('options', next);
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                            placeholder="e.g., Most Popular"
                                        />
                                    </div>
                                    <div className="flex items-center pt-8">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                disabled={!isEditing}
                                                checked={opt.bannerBehindShow || false}
                                                onChange={(e) => {
                                                    const next = [...editing.options];
                                                    next[idx].bannerBehindShow = e.target.checked;
                                                    update('options', next);
                                                }}
                                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                            />
                                            <span className="text-sm font-medium text-gray-700">Show Banner</span>
                                        </label>
                                    </div>
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
            </div >

            {/* Badges */}
            < div className="mt-6 bg-white rounded-lg shadow-sm border" >
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
            </div >

            {/* Guarantee Section */}
            < div className="mt-6 bg-white rounded-lg shadow-sm border" >
                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold">Guarantee Section</h2>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Guarantee Title</label>
                        <input
                            type="text"
                            disabled={!isEditing}
                            value={editing.guarantee?.title || ''}
                            onChange={(e) => updateGuarantee('title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">Guarantee Lines</label>
                            {isEditing && (
                                <button
                                    onClick={() => updateGuarantee('lines', [...(editing.guarantee?.lines || []), 'New line'])}
                                    className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
                                >
                                    <Plus className="w-3 h-3" /> Add Line
                                </button>
                            )}
                        </div>
                        <div className="space-y-2">
                            {(editing.guarantee?.lines || []).map((line, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        disabled={!isEditing}
                                        value={line}
                                        onChange={(e) => {
                                            const next = [...(editing.guarantee?.lines || [])];
                                            next[idx] = e.target.value;
                                            updateGuarantee('lines', next);
                                        }}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                    />
                                    {isEditing && (
                                        <button
                                            onClick={() => {
                                                const next = editing.guarantee?.lines?.filter((_, i) => i !== idx) || [];
                                                updateGuarantee('lines', next);
                                            }}
                                            className="p-2 rounded bg-red-50 text-red-600 hover:bg-red-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Refund Text</label>
                        <textarea
                            rows={3}
                            disabled={!isEditing}
                            value={editing.guarantee?.refundText || ''}
                            onChange={(e) => updateGuarantee('refundText', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                    </div>
                </div>
            </div >

            {/* Actions */}
            < div className="flex gap-2 pt-6" >
                <button
                    onClick={saveContent}
                    disabled={!isEditing || saving}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save'}
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
            </div >

            {
                message && (
                    <div className={`mt-4 p-3 rounded ${message.includes('Failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                        {message}
                    </div>
                )
            }

            <div className="mt-6 text-sm text-gray-600">
                This data powers your weight loss pricing page.
            </div>
        </div >
    );
}