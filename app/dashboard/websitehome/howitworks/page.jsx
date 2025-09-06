'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit, Save, X, Plus, Trash2 } from 'lucide-react';

export default function HowItWorksManagement() {
    const [content, setContent] = useState({
        eyebrow: 'FEEL STRONGER, HEALTHIER, AND MORE CONFIDENT',
        mainTitle: 'How it works with Somi Health',
        mainTitleHighlight: 'with Somi Health',
        steps: [],
        ctaText: 'Start your journey',
        ctaLink: '/getstarted'
    });
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingContent, setEditingContent] = useState({
        eyebrow: '',
        mainTitle: '',
        mainTitleHighlight: '',
        steps: [],
        ctaText: '',
        ctaLink: ''
    });

    useEffect(() => {
        fetchContent();
    }, []);

    async function fetchContent() {
        setLoading(true);
        try {
            const res = await fetch('/api/howitworks', { cache: 'no-store' });
            const data = await res.json();

            if (data?.success) {
                setContent(data.result);
            }
        } catch (error) {
            console.error('Error fetching How It Works content:', error);
        } finally {
            setLoading(false);
        }
    }

    function startEditing() {
        setEditingContent({
            eyebrow: content.eyebrow,
            mainTitle: content.mainTitle,
            mainTitleHighlight: content.mainTitleHighlight,
            steps: [...content.steps],
            ctaText: content.ctaText,
            ctaLink: content.ctaLink
        });
        setIsEditing(true);
    }

    function cancelEditing() {
        setIsEditing(false);
        setEditingContent({
            eyebrow: '',
            mainTitle: '',
            mainTitleHighlight: '',
            steps: [],
            ctaText: '',
            ctaLink: ''
        });
    }

    function addStep() {
        setEditingContent(prev => ({
            ...prev,
            steps: [...prev.steps, {
                eyebrow: '',
                caption: '',
                title: '',
                description: '',
                icon: 'ClipboardList'
            }]
        }));
    }

    function removeStep(index) {
        setEditingContent(prev => ({
            ...prev,
            steps: prev.steps.filter((_, i) => i !== index)
        }));
    }

    function updateStep(index, field, value) {
        setEditingContent(prev => ({
            ...prev,
            steps: prev.steps.map((step, i) => 
                i === index ? { ...step, [field]: value } : step
            )
        }));
    }

    async function saveContent() {
        try {
            const res = await fetch('/api/howitworks', {
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
                    eyebrow: '',
                    mainTitle: '',
                    mainTitleHighlight: '',
                    steps: [],
                    ctaText: '',
                    ctaLink: ''
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
                <h1 className="text-2xl font-semibold text-gray-900">How It Works Management</h1>
            </div>

            {/* Content Card */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-md">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">How It Works Content</h2>
                        <p className="text-sm text-gray-500">Manage the main heading, steps, and CTA button.</p>
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
                            {/* Main Heading */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Eyebrow Text
                                    </label>
                                    <input
                                        type="text"
                                        value={editingContent.eyebrow}
                                        onChange={(e) => setEditingContent(prev => ({ ...prev, eyebrow: e.target.value }))}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="FEEL STRONGER, HEALTHIER, AND MORE CONFIDENT"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Main Title
                                    </label>
                                    <input
                                        type="text"
                                        value={editingContent.mainTitle}
                                        onChange={(e) => setEditingContent(prev => ({ ...prev, mainTitle: e.target.value }))}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="How it works with Somi Health"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title Highlight
                                </label>
                                <input
                                    type="text"
                                    value={editingContent.mainTitleHighlight}
                                    onChange={(e) => setEditingContent(prev => ({ ...prev, mainTitleHighlight: e.target.value }))}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="with Somi Health"
                                />
                            </div>

                            {/* Steps */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Steps ({editingContent.steps.length})
                                    </label>
                                    <button
                                        onClick={addStep}
                                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
                                    >
                                        <Plus size={16} />
                                        Add Step
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {editingContent.steps.map((step, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-medium text-gray-900">Step {index + 1}</h4>
                                                <button
                                                    onClick={() => removeStep(index)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                                        Eyebrow
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={step.eyebrow}
                                                        onChange={(e) => updateStep(index, 'eyebrow', e.target.value)}
                                                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Unlock Your Best Self"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                                        Caption
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={step.caption}
                                                        onChange={(e) => updateStep(index, 'caption', e.target.value)}
                                                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="You deserve this!"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                                        Title
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={step.title}
                                                        onChange={(e) => updateStep(index, 'title', e.target.value)}
                                                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="1. Take the Questionnaire"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                                        Icon
                                                    </label>
                                                    <select
                                                        value={step.icon}
                                                        onChange={(e) => updateStep(index, 'icon', e.target.value)}
                                                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="ClipboardList">ClipboardList</option>
                                                        <option value="Video">Video</option>
                                                        <option value="Package">Package</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="mt-3">
                                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                                    Description
                                                </label>
                                                <textarea
                                                    value={step.description}
                                                    onChange={(e) => updateStep(index, 'description', e.target.value)}
                                                    rows={2}
                                                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Fill out a 7-minute questionnaire..."
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* CTA Button */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        CTA Text
                                    </label>
                                    <input
                                        type="text"
                                        value={editingContent.ctaText}
                                        onChange={(e) => setEditingContent(prev => ({ ...prev, ctaText: e.target.value }))}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Start your journey"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        CTA Link
                                    </label>
                                    <input
                                        type="text"
                                        value={editingContent.ctaLink}
                                        onChange={(e) => setEditingContent(prev => ({ ...prev, ctaLink: e.target.value }))}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="/getstarted"
                                    />
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
                            {/* Main Heading Display */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Main Heading</h3>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-2">{content.eyebrow}</p>
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {content.mainTitle.replace(content.mainTitleHighlight, '')}
                                        <span className="text-blue-600">{content.mainTitleHighlight}</span>
                                    </h2>
                                </div>
                            </div>

                            {/* Steps Display */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Steps ({content.steps.length})</h3>
                                <div className="space-y-3">
                                    {content.steps.map((step, index) => (
                                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                                                <span className="text-sm font-semibold text-gray-900">{step.title}</span>
                                                <span className="text-xs text-gray-500">({step.icon})</span>
                                            </div>
                                            <div className="text-xs text-gray-600 mb-1">
                                                <span className="font-medium">{step.eyebrow}</span> • {step.caption}
                                            </div>
                                            <p className="text-sm text-gray-700">{step.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* CTA Button Display */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">CTA Button</h3>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-700">
                                        <span className="font-medium">Text:</span> {content.ctaText}
                                    </p>
                                    <p className="text-sm text-gray-700">
                                        <span className="font-medium">Link:</span> {content.ctaLink}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
