'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Save, X, Trash2, Eye, Image as ImageIcon, Globe, Settings, HeartPlus, HeartPulse, ShieldCheck, Sparkles, Wallet } from 'lucide-react';
import UploadMediaLite from '@/components/UploadMediaLite';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AboutPageDashboard() {
    // State for about page content
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingContent, setEditingContent] = useState({});

    // Fetch about page content
    const fetchContent = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/about-page-content');
            const data = await res.json();

            if (data.success) {
                setContent(data.result);
                setEditingContent(data.result);
            }
        } catch (error) {
            console.error('Error fetching about page content:', error);
        } finally {
            setLoading(false);
        }
    };

    // Save about page content
    const saveContent = async () => {
        try {
            const res = await fetch('/api/about-page-content', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingContent)
            });

            const data = await res.json();
            if (data.success) {
                setContent(data.result);
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Error saving about page content:', error);
        }
    };

    // Initialize data
    useEffect(() => {
        fetchContent();
    }, []);

    return (
        <div className="p-6 w-full mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">About Page Management</h1>
                <p className="text-gray-600 mt-2">Manage about page content, images, and sections</p>
            </div>

            <div className="flex flex-col gap-6">
                {/* Content Editor */}
                <div>
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="p-6 border-b">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">About Page Content</h2>
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded"
                                >
                                    <Settings className="w-4 h-4" />
                                    {isEditing ? 'Cancel' : 'Edit'}
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {loading ? (
                                <div className="animate-pulse space-y-4">
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                </div>
                            ) : isEditing ? (
                                <div className="space-y-8">
                                    {/* Hero Section */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium text-gray-900">Hero Section</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Badge Text
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editingContent.hero?.badge || ''}
                                                    onChange={(e) => setEditingContent(prev => ({
                                                        ...prev,
                                                        hero: { ...prev.hero, badge: e.target.value }
                                                    }))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Hero Image
                                                </label>
                                                <UploadMediaLite
                                                    file={editingContent.hero?.image}
                                                    onUploadComplete={(url) => setEditingContent(prev => ({
                                                        ...prev,
                                                        hero: { ...prev.hero, image: url }
                                                    }))}
                                                    onDelete={() => setEditingContent(prev => ({
                                                        ...prev,
                                                        hero: { ...prev.hero, image: '' }
                                                    }))}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Title
                                            </label>
                                            <input
                                                type="text"
                                                value={editingContent.hero?.title || ''}
                                                onChange={(e) => setEditingContent(prev => ({
                                                    ...prev,
                                                    hero: { ...prev.hero, title: e.target.value }
                                                }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Subtitle
                                            </label>
                                            <textarea
                                                value={editingContent.hero?.subtitle || ''}
                                                onChange={(e) => setEditingContent(prev => ({
                                                    ...prev,
                                                    hero: { ...prev.hero, subtitle: e.target.value }
                                                }))}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Primary Button Text
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editingContent.hero?.primaryButton?.text || ''}
                                                    onChange={(e) => setEditingContent(prev => ({
                                                        ...prev,
                                                        hero: {
                                                            ...prev.hero,
                                                            primaryButton: { ...prev.hero?.primaryButton, text: e.target.value }
                                                        }
                                                    }))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Primary Button Link
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editingContent.hero?.primaryButton?.link || ''}
                                                    onChange={(e) => setEditingContent(prev => ({
                                                        ...prev,
                                                        hero: {
                                                            ...prev.hero,
                                                            primaryButton: { ...prev.hero?.primaryButton, link: e.target.value }
                                                        }
                                                    }))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Our Story Section */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium text-gray-900">Our Story Section</h3>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Story Image
                                            </label>
                                            <UploadMediaLite
                                                file={editingContent.ourStory?.image}
                                                onUploadComplete={(url) => setEditingContent(prev => ({
                                                    ...prev,
                                                    ourStory: { ...prev.ourStory, image: url }
                                                }))}
                                                onDelete={() => setEditingContent(prev => ({
                                                    ...prev,
                                                    ourStory: { ...prev.ourStory, image: '' }
                                                }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Title
                                            </label>
                                            <input
                                                type="text"
                                                value={editingContent.ourStory?.title || ''}
                                                onChange={(e) => setEditingContent(prev => ({
                                                    ...prev,
                                                    ourStory: { ...prev.ourStory, title: e.target.value }
                                                }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                First Paragraph
                                            </label>
                                            <textarea
                                                value={editingContent.ourStory?.paragraph1 || ''}
                                                onChange={(e) => setEditingContent(prev => ({
                                                    ...prev,
                                                    ourStory: { ...prev.ourStory, paragraph1: e.target.value }
                                                }))}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Second Paragraph
                                            </label>
                                            <textarea
                                                value={editingContent.ourStory?.paragraph2 || ''}
                                                onChange={(e) => setEditingContent(prev => ({
                                                    ...prev,
                                                    ourStory: { ...prev.ourStory, paragraph2: e.target.value }
                                                }))}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Value Cards */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium text-gray-900">Value Cards</h3>
                                        <div className="space-y-4">
                                            {editingContent.valueCards?.map((card, index) => (
                                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Icon
                                                            </label>
                                                            <Select
                                                                value={card.icon}
                                                                onValueChange={(value) => {
                                                                    const newCards = [...editingContent.valueCards];
                                                                    newCards[index].icon = value;
                                                                    setEditingContent((prev) => ({ ...prev, valueCards: newCards }));
                                                                }}
                                                            >
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue placeholder="Select an icon" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectGroup>
                                                                        <SelectItem value="HeartPulse">
                                                                            <div className="flex items-center gap-2">
                                                                                <HeartPulse className="h-4 w-4" />
                                                                                <span>Heart Pulse</span>
                                                                            </div>
                                                                        </SelectItem>
                                                                        <SelectItem value="ShieldCheck">
                                                                            <div className="flex items-center gap-2">
                                                                                <ShieldCheck className="h-4 w-4" />
                                                                                <span>Shield Check</span>
                                                                            </div>
                                                                        </SelectItem>
                                                                        <SelectItem value="Sparkles">
                                                                            <div className="flex items-center gap-2">
                                                                                <Sparkles className="h-4 w-4" />
                                                                                <span>Sparkles</span>
                                                                            </div>
                                                                        </SelectItem>
                                                                        <SelectItem value="Wallet">
                                                                            <div className="flex items-center gap-2">
                                                                                <Wallet className="h-4 w-4" />
                                                                                <span>Wallet</span>
                                                                            </div>
                                                                        </SelectItem>
                                                                    </SelectGroup>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Title
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={card.title}
                                                                onChange={(e) => {
                                                                    const newCards = [...editingContent.valueCards];
                                                                    newCards[index].title = e.target.value;
                                                                    setEditingContent(prev => ({ ...prev, valueCards: newCards }));
                                                                }}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Text
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={card.text}
                                                                onChange={(e) => {
                                                                    const newCards = [...editingContent.valueCards];
                                                                    newCards[index].text = e.target.value;
                                                                    setEditingContent(prev => ({ ...prev, valueCards: newCards }));
                                                                }}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Stats Section */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium text-gray-900">Stats Section</h3>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Title
                                            </label>
                                            <input
                                                type="text"
                                                value={editingContent.stats?.title || ''}
                                                onChange={(e) => setEditingContent(prev => ({
                                                    ...prev,
                                                    stats: { ...prev.stats, title: e.target.value }
                                                }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Subtitle
                                            </label>
                                            <textarea
                                                value={editingContent.stats?.subtitle || ''}
                                                onChange={(e) => setEditingContent(prev => ({
                                                    ...prev,
                                                    stats: { ...prev.stats, subtitle: e.target.value }
                                                }))}
                                                rows={2}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-4">
                                        <button
                                            onClick={saveContent}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                        >
                                            <Save className="w-4 h-4" />
                                            Save Content
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditing(false);
                                                setEditingContent(content);
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                        >
                                            <X className="w-4 h-4" />
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-medium text-gray-900">Hero Title</h3>
                                        <p className="text-sm text-gray-600">{content?.hero?.title || 'Somi Health empowers you with real solutions and expert care.'}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">Our Story Title</h3>
                                        <p className="text-sm text-gray-600">{content?.ourStory?.title || 'Weight loss built on trust, transparency, and connection.'}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">Value Cards</h3>
                                        <p className="text-sm text-gray-600">{content?.valueCards?.length || 4} cards configured</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Preview Panel */}
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-semibold">Page Preview</h2>
                        </div>
                        <div className="p-6">
                            <div className="text-sm text-gray-600">
                                <p>Preview your changes in real-time on the about page.</p>
                                <a
                                    href="/underdevelopmentmainpage/about"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 mt-2 text-blue-600 hover:text-blue-800"
                                >
                                    <Globe className="w-4 h-4" />
                                    View About Page
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
