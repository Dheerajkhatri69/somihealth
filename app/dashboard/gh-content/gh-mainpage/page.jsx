'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Save, X, Trash2, Settings, Globe, GripVertical, Image as ImageIcon } from 'lucide-react';
import UploadMediaLite from '@/components/UploadMediaLite';

function TextInput({ label, value, onChange, placeholder = '' }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <input
                type="text"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
        </div>
    );
}

function TextArea({ label, value, onChange, rows = 3, placeholder = '' }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <textarea
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                rows={rows}
                placeholder={placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
        </div>
    );
}

export default function GHContentDashboard() {
    const [content, setContent] = useState(null);
    const [editing, setEditing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchContent = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/gh-content', { cache: 'no-store' });
            const data = await res.json();
            if (data?.success) {
                setContent(data.result);
                setEditing(data.result);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const saveContent = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/gh-content', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editing)
            });
            const data = await res.json();
            if (data?.success) {
                setContent(data.result);
                setEditing(data.result);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => { fetchContent(); }, []);

    const partnerItems = editing?.partner?.items || [];
    const featureGroups = editing?.features?.groups || [];

    return (
        <div className="p-6 w-full mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">General Health Page</h1>
                    <p className="text-gray-600 mt-2">Manage hero, partner flow, and features</p>
                </div>
                <a href="/underdevelopmentmainpage/general-health" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800">
                    <Globe className="w-4 h-4" />
                    View Page
                </a>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Content Editor</h2>
                    <button
                        onClick={() => setEditing(content)}
                        className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Reset unsaved edits"
                    >
                        <Settings className="w-4 h-4" /> Reset edits
                    </button>
                </div>

                <div className="p-6 space-y-10">
                    {loading ? (
                        <div className="animate-pulse space-y-4">
                            <div className="h-4 bg-gray-200 rounded" />
                            <div className="h-4 bg-gray-200 rounded" />
                            <div className="h-4 bg-gray-200 rounded" />
                        </div>
                    ) : (
                        <>
                            {/* HERO */}
                            <section className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900">Hero</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <TextInput label="Heading" value={editing?.hero?.heading} onChange={(v) => setEditing(p => ({ ...p, hero: { ...p.hero, heading: v } }))} />
                                    <TextInput label="Price Note" value={editing?.hero?.priceNote} onChange={(v) => setEditing(p => ({ ...p, hero: { ...p.hero, priceNote: v } }))} />
                                    <TextInput label="CTA Label" value={editing?.hero?.ctaLabel} onChange={(v) => setEditing(p => ({ ...p, hero: { ...p.hero, ctaLabel: v } }))} />
                                    <TextInput label="CTA Href" value={editing?.hero?.ctaHref} onChange={(v) => setEditing(p => ({ ...p, hero: { ...p.hero, ctaHref: v } }))} />
                                </div>
                                <TextArea label="Subheading" value={editing?.hero?.subheading} onChange={(v) => setEditing(p => ({ ...p, hero: { ...p.hero, subheading: v } }))} rows={2} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Hero Image</label>
                                        <UploadMediaLite
                                            file={editing?.hero?.image?.src}
                                            onUploadComplete={(url) => setEditing(p => ({ ...p, hero: { ...p.hero, image: { ...p.hero.image, src: url } } }))}
                                            onDelete={() => setEditing(p => ({ ...p, hero: { ...p.hero, image: { ...p.hero.image, src: '' } } }))}
                                        />
                                    </div>
                                    <TextInput label="Hero Image Alt" value={editing?.hero?.image?.alt} onChange={(v) => setEditing(p => ({ ...p, hero: { ...p.hero, image: { ...p.hero.image, alt: v } } }))} />
                                </div>
                            </section>

                            {/* PARTNER */}
                            <section className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900">Partner Section</h3>
                                <TextInput label="Heading" value={editing?.partner?.heading} onChange={(v) => setEditing(p => ({ ...p, partner: { ...p.partner, heading: v } }))} />
                                <div className="space-y-4">
                                    {partnerItems.map((it, idx) => (
                                        <div key={it.id ?? idx} className="border border-gray-200 rounded-lg p-4 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <GripVertical className="w-4 h-4" />
                                                    <span className="text-sm">Item #{it.id ?? idx + 1}</span>
                                                </div>
                                                <button
                                                    className="text-red-600 hover:bg-red-50 rounded px-2 py-1 inline-flex items-center gap-1"
                                                    onClick={() => {
                                                        const copy = [...partnerItems];
                                                        copy.splice(idx, 1);
                                                        setEditing(p => ({ ...p, partner: { ...p.partner, items: copy } }));
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4" /> Remove
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <TextInput label="Title" value={it.title} onChange={(v) => {
                                                    const copy = [...partnerItems]; copy[idx] = { ...copy[idx], title: v };
                                                    setEditing(p => ({ ...p, partner: { ...p.partner, items: copy } }));
                                                }} />
                                                <TextInput label="Alt" value={it.icon?.alt} onChange={(v) => {
                                                    const copy = [...partnerItems]; copy[idx] = { ...copy[idx], icon: { ...copy[idx].icon, alt: v } };
                                                    setEditing(p => ({ ...p, partner: { ...p.partner, items: copy } }));
                                                }} />
                                            </div>
                                            <TextArea label="Description" value={it.desc} onChange={(v) => {
                                                const copy = [...partnerItems]; copy[idx] = { ...copy[idx], desc: v };
                                                setEditing(p => ({ ...p, partner: { ...p.partner, items: copy } }));
                                            }} />

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Icon Image</label>
                                                    <UploadMediaLite
                                                        file={it.icon?.src}
                                                        onUploadComplete={(url) => {
                                                            const copy = [...partnerItems]; copy[idx] = { ...copy[idx], icon: { ...copy[idx].icon, src: url } };
                                                            setEditing(p => ({ ...p, partner: { ...p.partner, items: copy } }));
                                                        }}
                                                        onDelete={() => {
                                                            const copy = [...partnerItems]; copy[idx] = { ...copy[idx], icon: { ...copy[idx].icon, src: '' } };
                                                            setEditing(p => ({ ...p, partner: { ...p.partner, items: copy } }));
                                                        }}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <TextInput label="Icon Width" value={it.icon?.width} onChange={(v) => {
                                                        const val = Number(v) || 80;
                                                        const copy = [...partnerItems]; copy[idx] = { ...copy[idx], icon: { ...copy[idx].icon, width: val } };
                                                        setEditing(p => ({ ...p, partner: { ...p.partner, items: copy } }));
                                                    }} />
                                                    <TextInput label="Icon Height" value={it.icon?.height} onChange={(v) => {
                                                        const val = Number(v) || 80;
                                                        const copy = [...partnerItems]; copy[idx] = { ...copy[idx], icon: { ...copy[idx].icon, height: val } };
                                                        setEditing(p => ({ ...p, partner: { ...p.partner, items: copy } }));
                                                    }} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        className="inline-flex items-center gap-2 px-3 py-2 rounded bg-slate-900 text-white hover:opacity-90"
                                        onClick={() => {
                                            const nextId = (partnerItems[partnerItems.length - 1]?.id || 0) + 1;
                                            const copy = [...partnerItems, {
                                                id: nextId,
                                                title: "New item",
                                                desc: "Describe this step...",
                                                icon: { src: "", alt: "", width: 80, height: 80 }
                                            }];
                                            setEditing(p => ({ ...p, partner: { ...p.partner, items: copy } }));
                                        }}
                                    >
                                        <Plus className="w-4 h-4" /> Add Partner Item
                                    </button>
                                </div>
                            </section>

                            {/* FEATURES */}
                            <section className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900">Features</h3>
                                <TextInput label="Heading" value={editing?.features?.heading} onChange={(v) => setEditing(p => ({ ...p, features: { ...p.features, heading: v } }))} />
                                <TextArea label="Intro" value={editing?.features?.intro} onChange={(v) => setEditing(p => ({ ...p, features: { ...p.features, intro: v } }))} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Features Image</label>
                                        <UploadMediaLite
                                            file={editing?.features?.image?.src}
                                            onUploadComplete={(url) => setEditing(p => ({ ...p, features: { ...p.features, image: { ...p.features.image, src: url } } }))}
                                            onDelete={() => setEditing(p => ({ ...p, features: { ...p.features, image: { ...p.features.image, src: '' } } }))}
                                        />
                                    </div>
                                    <TextInput label="Image Alt" value={editing?.features?.image?.alt} onChange={(v) => setEditing(p => ({ ...p, features: { ...p.features, image: { ...p.features.image, alt: v } } }))} />
                                </div>

                                <div className="space-y-4">
                                    {featureGroups.map((g, idx) => (
                                        <div key={idx} className="border rounded-lg p-4 border-gray-200 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-500 flex items-center gap-2"><GripVertical className="w-4 h-4" /> Group #{idx + 1}</span>
                                                <button
                                                    className="text-red-600 hover:bg-red-50 rounded px-2 py-1 inline-flex items-center gap-1"
                                                    onClick={() => {
                                                        const copy = [...featureGroups]; copy.splice(idx, 1);
                                                        setEditing(p => ({ ...p, features: { ...p.features, groups: copy } }));
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4" /> Remove
                                                </button>
                                            </div>

                                            <TextInput label="Title" value={g.title} onChange={(v) => {
                                                const copy = [...featureGroups]; copy[idx] = { ...copy[idx], title: v };
                                                setEditing(p => ({ ...p, features: { ...p.features, groups: copy } }));
                                            }} />
                                            <TextArea
                                                label="Items (comma-separated)"
                                                value={(g.items || []).join(', ')}
                                                onChange={(v) => {
                                                    const arr = v.split(',').map(s => s.trim()).filter(Boolean);
                                                    const copy = [...featureGroups]; copy[idx] = { ...copy[idx], items: arr };
                                                    setEditing(p => ({ ...p, features: { ...p.features, groups: copy } }));
                                                }}
                                                rows={2}
                                            />
                                        </div>
                                    ))}

                                    <button
                                        className="inline-flex items-center gap-2 px-3 py-2 rounded bg-slate-900 text-white hover:opacity-90"
                                        onClick={() => {
                                            const copy = [...featureGroups, { title: 'New group', items: ['Example item'] }];
                                            setEditing(p => ({ ...p, features: { ...p.features, groups: copy } }));
                                        }}
                                    >
                                        <Plus className="w-4 h-4" /> Add Feature Group
                                    </button>
                                </div>
                            </section>

                            {/* ACTIONS */}
                            <div className="flex gap-2 pt-4">
                                <button
                                    onClick={saveContent}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60"
                                >
                                    <Save className="w-4 h-4" />
                                    {saving ? 'Saving…' : 'Save Changes'}
                                </button>
                                <button
                                    onClick={() => setEditing(content)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                >
                                    <X className="w-4 h-4" />
                                    Cancel
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
