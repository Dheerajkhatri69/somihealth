'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit, Save, X, Plus, Trash2 } from 'lucide-react';
import UploadMediaLite from '@/components/UploadMediaLite';

export default function ResultsManagement() {
    const [content, setContent] = useState({
        tabs: [],
        watermark: {
            text: 'somi',
            size: '160px',
            strokeColor: '#364c781d',
            strokeWidth: '2px',
            fill: 'transparent',
            font: '"Sofia Sans", ui-sans-serif',
            weight: 700,
            tracking: '0em',
            opacity: 1,
            left: '0rem',
            top: '8rem',
            rotate: '0deg'
        },
        header: {
            eyebrow: '',
            headlineLeft: '',
            headlineRight: ''
        },
        image: ''
    });
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingContent, setEditingContent] = useState({
        tabs: [],
        watermark: {
            text: '',
            size: '',
            strokeColor: '',
            strokeWidth: '',
            fill: '',
            font: '',
            weight: 700,
            tracking: '',
            opacity: 1,
            left: '',
            top: '',
            rotate: ''
        },
        header: {
            eyebrow: '',
            headlineLeft: '',
            headlineRight: ''
        },
        image: ''
    });

    useEffect(() => {
        fetchContent();
    }, []);

    async function fetchContent() {
        setLoading(true);
        try {
            const res = await fetch('/api/results', { cache: 'no-store' });
            const data = await res.json();

            if (data?.success) {
                setContent(data.result);
            }
        } catch (error) {
            console.error('Error fetching Results content:', error);
        } finally {
            setLoading(false);
        }
    }

    function startEditing() {
        setEditingContent({
            tabs: [...content.tabs],
            watermark: { ...content.watermark },
            header: { ...content.header },
            image: content.image || ''
        });
        setIsEditing(true);
    }

    function cancelEditing() {
        setIsEditing(false);
        setEditingContent({
            tabs: [],
            watermark: {
                text: '',
                size: '',
                strokeColor: '',
                strokeWidth: '',
                fill: '',
                font: '',
                weight: 700,
                tracking: '',
                opacity: 1,
                left: '',
                top: '',
                rotate: ''
            },
            header: {
                eyebrow: '',
                headlineLeft: '',
                headlineRight: ''
            },
            image: ''
        });
    }

    function addTab() {
        setEditingContent(prev => ({
            ...prev,
            tabs: [...prev.tabs, {
                title: '',
                value: '',
                color: '#3B82F6',
                bg: '#EAF2FF',
                bgActive: '#DCEAFF',
                bullets: [''],
                body: '',
                icon: 'Beaker'
            }]
        }));
    }

    function removeTab(index) {
        setEditingContent(prev => ({
            ...prev,
            tabs: prev.tabs.filter((_, i) => i !== index)
        }));
    }

    function updateTab(index, field, value) {
        setEditingContent(prev => ({
            ...prev,
            tabs: prev.tabs.map((tab, i) => 
                i === index ? { ...tab, [field]: value } : tab
            )
        }));
    }

    function addBullet(tabIndex) {
        setEditingContent(prev => ({
            ...prev,
            tabs: prev.tabs.map((tab, i) => 
                i === tabIndex ? { ...tab, bullets: [...tab.bullets, ''] } : tab
            )
        }));
    }

    function removeBullet(tabIndex, bulletIndex) {
        setEditingContent(prev => ({
            ...prev,
            tabs: prev.tabs.map((tab, i) => 
                i === tabIndex ? { 
                    ...tab, 
                    bullets: tab.bullets.filter((_, bi) => bi !== bulletIndex) 
                } : tab
            )
        }));
    }

    function updateBullet(tabIndex, bulletIndex, value) {
        setEditingContent(prev => ({
            ...prev,
            tabs: prev.tabs.map((tab, i) => 
                i === tabIndex ? { 
                    ...tab, 
                    bullets: tab.bullets.map((bullet, bi) => 
                        bi === bulletIndex ? value : bullet
                    )
                } : tab
            )
        }));
    }

    function updateWatermark(field, value) {
        setEditingContent(prev => ({
            ...prev,
            watermark: { ...prev.watermark, [field]: value }
        }));
    }

    async function saveContent() {
        try {
            const res = await fetch('/api/results', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...editingContent,
                    isActive: true
                }),
            });

            const data = await res.json();
            if (data.success) {
                setContent(data.result);
                setIsEditing(false);
                setEditingContent({
                    tabs: [],
                    watermark: {
                        text: '',
                        size: '',
                        strokeColor: '',
                        strokeWidth: '',
                        fill: '',
                        font: '',
                        weight: 700,
                        tracking: '',
                        opacity: 1,
                        left: '',
                        top: '',
                        rotate: ''
                    },
                    header: { eyebrow: '', headlineLeft: '', headlineRight: '' },
                    image: ''
                });
            } else {
                alert('Error saving content: ' + data.message);
            }
        } catch (error) {
            console.error('Error saving content:', error);
            alert('Error saving content');
        }
    }

    if (loading) {
        return (
            <div className="p-4">
                <div className="space-y-4">
                    <div className="h-8 w-48 rounded bg-gray-200 animate-pulse" />
                    <div className="h-64 w-full rounded bg-gray-200 animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="p-4">
            {/* Header */}
            <div className="mb-6 flex items-center gap-4">
                <Link
                    href="/dashboard/websitehome"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft size={20} />
                    Back to Dashboard
                </Link>
                <div className="h-6 w-px bg-gray-300" />
                <h1 className="text-2xl font-semibold text-gray-900">Results Management</h1>
            </div>

            {/* Content Card */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-md">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Results Content</h2>
                        <p className="text-sm text-gray-500">Manage tabs, bullets, and watermark settings.</p>
                    </div>
                    {!isEditing && (
                        <button
                            onClick={startEditing}
                            className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-white hover:bg-secondary/80"
                        >
                            <Edit size={18} />
                            Edit Content
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-6">
                    {isEditing ? (
                        <div className="space-y-6">
                            {/* Tabs */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Tabs ({editingContent.tabs.length})
                                    </label>
                                    <button
                                        onClick={addTab}
                                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
                                    >
                                        <Plus size={16} />
                                        Add Tab
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {editingContent.tabs.map((tab, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-medium text-gray-900">Tab {index + 1}</h4>
                                                <button
                                                    onClick={() => removeTab(index)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                                        Title
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={tab.title}
                                                        onChange={(e) => updateTab(index, 'title', e.target.value)}
                                                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Research"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                                        Value
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={tab.value}
                                                        onChange={(e) => updateTab(index, 'value', e.target.value)}
                                                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="research"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                                        Color
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={tab.color}
                                                        onChange={(e) => updateTab(index, 'color', e.target.value)}
                                                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="#3B82F6"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                                        Background
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={tab.bg}
                                                        onChange={(e) => updateTab(index, 'bg', e.target.value)}
                                                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="#EAF2FF"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                                        Active Background
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={tab.bgActive}
                                                        onChange={(e) => updateTab(index, 'bgActive', e.target.value)}
                                                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="#DCEAFF"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                                        Icon
                                                    </label>
                                                    <select
                                                        value={tab.icon}
                                                        onChange={(e) => updateTab(index, 'icon', e.target.value)}
                                                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="Beaker">Beaker</option>
                                                        <option value="BadgeDollarSign">BadgeDollarSign</option>
                                                        <option value="ShieldCheck">ShieldCheck</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="mt-3">
                                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                                    Body Text
                                                </label>
                                                <textarea
                                                    value={tab.body}
                                                    onChange={(e) => updateTab(index, 'body', e.target.value)}
                                                    rows={3}
                                                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="At Somi Health, we offer GLP-1 and GIP/GLP-1 therapies..."
                                                />
                                            </div>

                                            {/* Bullets */}
                                            <div className="mt-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="block text-xs font-medium text-gray-600">
                                                        Bullets ({tab.bullets.length})
                                                    </label>
                                                    <button
                                                        onClick={() => addBullet(index)}
                                                        className="text-xs text-blue-600 hover:text-blue-700"
                                                    >
                                                        + Add Bullet
                                                    </button>
                                                </div>
                                                <div className="space-y-2">
                                                    {tab.bullets.map((bullet, bulletIndex) => (
                                                        <div key={bulletIndex} className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                value={bullet}
                                                                onChange={(e) => updateBullet(index, bulletIndex, e.target.value)}
                                                                className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                placeholder="Years Of Research"
                                                            />
                                                            <button
                                                                onClick={() => removeBullet(index, bulletIndex)}
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Header & Image */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-900 mb-3">Header</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Eyebrow</label>
                                            <input
                                                type="text"
                                                value={editingContent.header.eyebrow}
                                                onChange={(e) => setEditingContent(prev => ({ ...prev, header: { ...prev.header, eyebrow: e.target.value } }))}
                                                className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Feel stronger, healthier, and more confident"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Headline Left</label>
                                            <input
                                                type="text"
                                                value={editingContent.header.headlineLeft}
                                                onChange={(e) => setEditingContent(prev => ({ ...prev, header: { ...prev.header, headlineLeft: e.target.value } }))}
                                                className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="How it works"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Headline Right</label>
                                            <input
                                                type="text"
                                                value={editingContent.header.headlineRight}
                                                onChange={(e) => setEditingContent(prev => ({ ...prev, header: { ...prev.header, headlineRight: e.target.value } }))}
                                                className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="at Somi Health"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="border border-gray-2 00 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-900 mb-3">Main Image</h3>
                                    <div className="space-y-3">
                                        <UploadMediaLite
                                            file={editingContent.image}
                                            onUploadComplete={(url) => setEditingContent(prev => ({ ...prev, image: url }))}
                                            onDelete={() => setEditingContent(prev => ({ ...prev, image: '' }))}
                                        />
                                        <p className="text-xs text-gray-500">Upload an image; the URL will be stored and used by the Results section.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Watermark Settings */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Watermark Settings</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Text
                                        </label>
                                        <input
                                            type="text"
                                            value={editingContent.watermark.text}
                                            onChange={(e) => updateWatermark('text', e.target.value)}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="somi"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Size
                                        </label>
                                        <input
                                            type="text"
                                            value={editingContent.watermark.size}
                                            onChange={(e) => updateWatermark('size', e.target.value)}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="160px"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Stroke Color
                                        </label>
                                        <input
                                            type="text"
                                            value={editingContent.watermark.strokeColor}
                                            onChange={(e) => updateWatermark('strokeColor', e.target.value)}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="#364c781d"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Stroke Width
                                        </label>
                                        <input
                                            type="text"
                                            value={editingContent.watermark.strokeWidth}
                                            onChange={(e) => updateWatermark('strokeWidth', e.target.value)}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="2px"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Font
                                        </label>
                                        <input
                                            type="text"
                                            value={editingContent.watermark.font}
                                            onChange={(e) => updateWatermark('font', e.target.value)}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder='"Sofia Sans", ui-sans-serif'
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Weight
                                        </label>
                                        <input
                                            type="number"
                                            value={editingContent.watermark.weight}
                                            onChange={(e) => updateWatermark('weight', parseInt(e.target.value))}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="700"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-6 border-t border-gray-200">
                                <button
                                    onClick={saveContent}
                                    className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                                >
                                    <Save size={16} />
                                    Save Changes
                                </button>
                                <button
                                    onClick={cancelEditing}
                                    className="inline-flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                                >
                                    <X size={16} />
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Tabs Display */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tabs ({content.tabs.length})</h3>
                                <div className="space-y-3">
                                    {content.tabs.map((tab, index) => (
                                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                                                <span className="text-sm font-semibold text-gray-900">{tab.title}</span>
                                                <span className="text-xs text-gray-500">({tab.icon})</span>
                                            </div>
                                            <p className="text-sm text-gray-700 mb-2">{tab.body}</p>
                                            <div className="flex flex-wrap gap-1">
                                                {tab.bullets.map((bullet, bulletIndex) => (
                                                    <span key={bulletIndex} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                                        {bullet}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Watermark Display */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Watermark Settings</h3>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <p><span className="font-medium">Text:</span> {content.watermark.text}</p>
                                        <p><span className="font-medium">Size:</span> {content.watermark.size}</p>
                                        <p><span className="font-medium">Stroke Color:</span> {content.watermark.strokeColor}</p>
                                        <p><span className="font-medium">Stroke Width:</span> {content.watermark.strokeWidth}</p>
                                        <p><span className="font-medium">Font:</span> {content.watermark.font}</p>
                                        <p><span className="font-medium">Weight:</span> {content.watermark.weight}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
