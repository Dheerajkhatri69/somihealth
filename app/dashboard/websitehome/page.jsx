'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Eye, Edit, Save, X, Play, Trash2 } from 'lucide-react';
import VideoUpload from '@/components/VideoUpload';
import UploadMediaLite from '@/components/UploadMediaLite';
import Image from 'next/image';
import * as LucideIcons from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import toast from 'react-hot-toast';

export default function WebsiteHome() {
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState('');

    // Hero text state
    const [heroText, setHeroText] = useState({
        mainTitle: 'Look Better, Feel Better, Live Better.',
        rotatingLines: [
            'No hidden fees. No hassle. Just results.',
            'Custom plans. Real help. Real care.'
        ]
    });
    const [heroLoading, setHeroLoading] = useState(true);
    const [isEditingHero, setIsEditingHero] = useState(false);
    const [editingHero, setEditingHero] = useState({
        mainTitle: '',
        rotatingLines: ['']
    });

    // Review videos state
    const [videos, setVideos] = useState([]);
    const [videoLoading, setVideoLoading] = useState(true);
    const [isEditingVideo, setIsEditingVideo] = useState(false);
    const [editingVideo, setEditingVideo] = useState({
        _id: null,
        title: '',
        subtitle: '',
        description: '',
        poster: '',
        srcMp4: '',
        srcWebm: ''
    });
    const [showVideoUpload, setShowVideoUpload] = useState(false);

    // Reviews state
    const [reviews, setReviews] = useState([]);
    const [reviewLoading, setReviewLoading] = useState(true);

    // BMI Content state
    const [bmiContent, setBmiContent] = useState({
        title: 'See how much weight you could lose — how different life could feel.',
        description: 'Backed by real medicine and real results, somi helps you reach your goals without constant hunger or unsustainable plans. Just choose your starting point to see what\'s possible.',
        image: '/hero/bmilady.png'
    });
    const [bmiLoading, setBmiLoading] = useState(true);
    const [isEditingBmi, setIsEditingBmi] = useState(false);
    const [editingBmi, setEditingBmi] = useState({
        title: '',
        description: '',
        image: ''
    });
    const [showBmiImageUpload, setShowBmiImageUpload] = useState(false);

    // Compounded Content state
    const [compoundedContent, setCompoundedContent] = useState({
        title: 'What are Compounded GLP-1 Medications?',
        tabs: [],
        image: '/hero/bmilady.png'
    });
    const [compoundedLoading, setCompoundedLoading] = useState(true);
    const [isEditingCompounded, setIsEditingCompounded] = useState(false);
    const [editingCompounded, setEditingCompounded] = useState({
        title: '',
        tabs: [],
        image: ''
    });
    const [showCompoundedImageUpload, setShowCompoundedImageUpload] = useState(false);

    // How It Works state
    const [howItWorksContent, setHowItWorksContent] = useState({
        eyebrow: 'FEEL STRONGER, HEALTHIER, AND MORE CONFIDENT',
        mainTitle: 'How it works with Somi Health',
        mainTitleHighlight: 'with Somi Health',
        steps: [],
        ctaText: 'Start your journey',
        ctaLink: '/getstarted'
    });
    const [howItWorksLoading, setHowItWorksLoading] = useState(true);

    // Results state
    const [resultsContent, setResultsContent] = useState({
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
        }
    });
    const [resultsLoading, setResultsLoading] = useState(true);

    useEffect(() => {
        fetchMenus();
        fetchHeroText();
        fetchVideos();
        fetchReviews();
        fetchBmiContent();
        fetchCompoundedContent();
        fetchHowItWorksContent();
        fetchResultsContent();
    }, []);

    // Refresh when page becomes visible (e.g., when coming back from menus page)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetchMenus();
                fetchHeroText();
                fetchVideos();
                fetchReviews();
                fetchBmiContent();
                fetchCompoundedContent();
                fetchHowItWorksContent();
                fetchResultsContent();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    async function fetchMenus() {
        setLoading(true);
        try {
            const res = await fetch('/api/menus', { cache: 'no-store' });
            const data = await res.json();

            if (data?.success) {
                // Data is now returned as an array from API, already sorted by sortOrder
                const arr = Array.isArray(data.result) ? data.result : [];
                setMenus(arr);
            } else {
                setMenus([]);
            }
        } catch {
            setMenus([]);
        } finally {
            setLoading(false);
        }
    }

    async function fetchHeroText() {
        setHeroLoading(true);
        try {
            const res = await fetch('/api/hero-text', { cache: 'no-store' });
            const data = await res.json();

            if (data?.success) {
                setHeroText(data.result);
            }
        } catch (error) {
            console.error('Error fetching hero text:', error);
        } finally {
            setHeroLoading(false);
        }
    }

    function startEditingHero() {
        setEditingHero({
            mainTitle: heroText.mainTitle,
            rotatingLines: [...heroText.rotatingLines]
        });
        setIsEditingHero(true);
    }

    function cancelEditingHero() {
        setIsEditingHero(false);
        setEditingHero({
            mainTitle: '',
            rotatingLines: ['']
        });
    }

    function addRotatingLine() {
        setEditingHero(prev => ({
            ...prev,
            rotatingLines: [...prev.rotatingLines, '']
        }));
    }

    function removeRotatingLine(index) {
        if (editingHero.rotatingLines.length > 1) {
            setEditingHero(prev => ({
                ...prev,
                rotatingLines: prev.rotatingLines.filter((_, i) => i !== index)
            }));
        }
    }

    function updateRotatingLine(index, value) {
        setEditingHero(prev => ({
            ...prev,
            rotatingLines: prev.rotatingLines.map((line, i) => i === index ? value : line)
        }));
    }

    async function saveHeroText() {
        try {
            const res = await fetch('/api/hero-text', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mainTitle: editingHero.mainTitle,
                    rotatingLines: editingHero.rotatingLines.filter(line => line.trim() !== ''),
                    isActive: true
                }),
            });

            const data = await res.json();
            if (data.success) {
                setHeroText(data.result);
                setIsEditingHero(false);
                setEditingHero({
                    mainTitle: '',
                    rotatingLines: ['']
                });
            } else {
                alert('Error saving hero text: ' + data.message);
            }
        } catch (error) {
            console.error('Error saving hero text:', error);
            alert('Error saving hero text');
        }
    }

    async function fetchVideos() {
        setVideoLoading(true);
        try {
            const res = await fetch('/api/review-videos', { cache: 'no-store' });
            const data = await res.json();

            if (data?.success) {
                setVideos(data.result);
            }
        } catch (error) {
            console.error('Error fetching videos:', error);
        } finally {
            setVideoLoading(false);
        }
    }

    function startEditingVideo(video = null) {
        if (video) {
            setEditingVideo({
                _id: video._id, // Preserve the _id for updates
                title: video.title || '',
                subtitle: video.subtitle || '',
                description: video.description || '',
                poster: video.poster || '',
                srcMp4: video.srcMp4 || '',
                srcWebm: video.srcWebm || ''
            });
        } else {
            setEditingVideo({
                _id: null, // No _id for new videos
                title: '',
                subtitle: '',
                description: '',
                poster: '',
                srcMp4: '',
                srcWebm: ''
            });
        }
        setIsEditingVideo(true);
    }

    function cancelEditingVideo() {
        setIsEditingVideo(false);
        setEditingVideo({
            _id: null,
            title: '',
            subtitle: '',
            description: '',
            poster: '',
            srcMp4: '',
            srcWebm: ''
        });
        setShowVideoUpload(false);
    }

    async function saveVideo() {
        try {
            const method = editingVideo._id ? 'PUT' : 'POST';
            const body = {
                ...editingVideo,
                ...(editingVideo._id && { id: editingVideo._id })
            };

            const res = await fetch('/api/review-videos', {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            const data = await res.json();
            if (data.success) {
                setVideos(prev => {
                    if (editingVideo._id) {
                        return prev.map(v => v._id === editingVideo._id ? data.result : v);
                    } else {
                        return [...prev, data.result];
                    }
                });
                setIsEditingVideo(false);
                setEditingVideo({
                    _id: null,
                    title: '',
                    subtitle: '',
                    description: '',
                    poster: '',
                    srcMp4: '',
                    srcWebm: ''
                });
                setShowVideoUpload(false);
            } else {
                alert('Error saving video: ' + data.message);
            }
        } catch (error) {
            console.error('Error saving video:', error);
            alert('Error saving video');
        }
    }

    async function deleteVideo(videoId) {
        if (!confirm('Are you sure you want to delete this video?')) return;

        try {
            const res = await fetch(`/api/review-videos?id=${videoId}`, {
                method: 'DELETE',
            });

            const data = await res.json();
            if (data.success) {
                setVideos(prev => prev.filter(v => v._id !== videoId));
            } else {
                alert('Error deleting video: ' + data.message);
            }
        } catch (error) {
            console.error('Error deleting video:', error);
            alert('Error deleting video');
        }
    }

    async function fetchReviews() {
        setReviewLoading(true);
        try {
            const res = await fetch('/api/reviews', { cache: 'no-store' });
            const data = await res.json();

            if (data?.success) {
                setReviews(data.result);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setReviewLoading(false);
        }
    }

    async function fetchBmiContent() {
        setBmiLoading(true);
        try {
            const res = await fetch('/api/bmi-content', { cache: 'no-store' });
            const data = await res.json();

            if (data?.success) {
                setBmiContent(data.result);
            }
        } catch (error) {
            console.error('Error fetching BMI content:', error);
        } finally {
            setBmiLoading(false);
        }
    }

    async function fetchCompoundedContent() {
        setCompoundedLoading(true);
        try {
            const res = await fetch('/api/compounded-content', { cache: 'no-store' });
            const data = await res.json();

            if (data?.success) {
                setCompoundedContent(data.result);
            }
        } catch (error) {
            console.error('Error fetching compounded content:', error);
        } finally {
            setCompoundedLoading(false);
        }
    }

    async function fetchHowItWorksContent() {
        setHowItWorksLoading(true);
        try {
            const res = await fetch('/api/howitworks', { cache: 'no-store' });
            const data = await res.json();

            if (data?.success) {
                setHowItWorksContent(data.result);
            }
        } catch (error) {
            console.error('Error fetching How It Works content:', error);
        } finally {
            setHowItWorksLoading(false);
        }
    }

    async function fetchResultsContent() {
        setResultsLoading(true);
        try {
            const res = await fetch('/api/results', { cache: 'no-store' });
            const data = await res.json();

            if (data?.success) {
                setResultsContent(data.result);
            }
        } catch (error) {
            console.error('Error fetching Results content:', error);
        } finally {
            setResultsLoading(false);
        }
    }

    function startEditingBmi() {
        setEditingBmi({
            title: bmiContent.title,
            description: bmiContent.description,
            image: bmiContent.image
        });
        setIsEditingBmi(true);
    }

    function cancelEditingBmi() {
        setIsEditingBmi(false);
        setEditingBmi({
            title: '',
            description: '',
            image: ''
        });
        setShowBmiImageUpload(false);
    }

    async function saveBmiContent() {
        try {
            const res = await fetch('/api/bmi-content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: editingBmi.title,
                    description: editingBmi.description,
                    image: editingBmi.image,
                    isActive: true
                }),
            });

            const data = await res.json();
            if (data.success) {
                setBmiContent(data.result);
                setIsEditingBmi(false);
                setEditingBmi({
                    title: '',
                    description: '',
                    image: ''
                });
            } else {
                alert('Error saving BMI content: ' + data.message);
            }
        } catch (error) {
            console.error('Error saving BMI content:', error);
            alert('Error saving BMI content');
        }
    }

    function startEditingCompounded() {
        setEditingCompounded({
            title: compoundedContent.title,
            tabs: Array.isArray(compoundedContent.tabs) ? [...compoundedContent.tabs] : [],
            image: compoundedContent.image
        });
        setIsEditingCompounded(true);
    }

    function cancelEditingCompounded() {
        setIsEditingCompounded(false);
        setEditingCompounded({
            title: '',
            tabs: [],
            image: ''
        });
        setShowCompoundedImageUpload(false);
    }

    async function saveCompoundedContent() {
        try {
            const res = await fetch('/api/compounded-content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: editingCompounded.title,
                    tabs: editingCompounded.tabs,
                    image: editingCompounded.image,
                    isActive: true
                }),
            });

            const data = await res.json();
            if (data.success) {
                setCompoundedContent(data.result);
                setIsEditingCompounded(false);
                setEditingCompounded({
                    title: '',
                    tabs: [],
                    image: ''
                });
            } else {
                alert('Error saving compounded content: ' + data.message);
            }
        } catch (error) {
            console.error('Error saving compounded content:', error);
            alert('Error saving compounded content');
        }
    }

    const filtered = useMemo(() => {
        if (!q.trim()) return menus;
        const needle = q.trim().toLowerCase();
        return menus.filter((m) => (m.name || '').toLowerCase().includes(needle));
    }, [menus, q]);

    // Icon options for compounded tabs
    const COMPOUNDED_ICON_OPTIONS = [
        { value: 'Beaker', label: 'Beaker' },
        { value: 'ShieldCheck', label: 'ShieldCheck' },
        { value: 'BadgeDollarSign', label: 'Badge Dollar Sign' },
        { value: 'Check', label: 'Check' },
        { value: 'Star', label: 'Star' },
        { value: 'Heart', label: 'Heart' },
        { value: 'Shield', label: 'Shield' },
        { value: 'Zap', label: 'Zap' },
        { value: 'Award', label: 'Award' },
        { value: 'Clock', label: 'Clock' },
        { value: 'Users', label: 'Users' },
        { value: 'TrendingUp', label: 'Trending Up' },
        { value: 'Target', label: 'Target' },
        { value: 'Rocket', label: 'Rocket' },
        { value: 'Lock', label: 'Lock' },
        { value: 'Globe', label: 'Globe' },
        { value: 'Gift', label: 'Gift' },
        { value: 'DollarSign', label: 'Dollar Sign' },
        { value: 'Calendar', label: 'Calendar' },
        { value: 'Bell', label: 'Bell' },
        { value: 'Bookmark', label: 'Bookmark' },
        { value: 'Camera', label: 'Camera' },
        { value: 'Code', label: 'Code' }
    ];
    const [text, setText] = useState("From stuck to thriving.");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const r = await fetch("/api/review-header?key=client-reviews-header", { cache: "no-store" });
                const j = await r.json();
                if (j?.success && j?.result?.text) setText(j.result.text);
            } catch (e) {
                console.error(e);
            }
        })();
    }, []);

    const save = async () => {
        setSaving(true);
        try {
            const r = await fetch("/api/review-header", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: "client-reviews-header", text }),
            });
            const j = await r.json();
            if (!j?.success) throw new Error(j?.message || "Save failed");
            toast.success("Saved!");
        } catch (e) {
            toast.error(e.message || "Error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-4">
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Section - Menus */}
                <section className="w-full lg:w-1/2">
                    {/* Header */}
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Menus</h1>
                            <p className="text-sm text-gray-500">Pick a menu to view full details or create a new one.</p>
                        </div>
                        <Link
                            href="/dashboard/websitehome/menus/new"
                            className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-white hover:bg-secondary/80"
                        >
                            <Plus size={18} />
                            New
                        </Link>
                    </div>

                    {/* Card */}
                    <div className="rounded-2xl border-l-4 border border-gray-200 border-l-secondary bg-white shadow-md">
                        {/* Toolbar */}
                        <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100">
                            <span className="text-sm font-medium text-gray-700">All Menus</span>
                            <span className="ml-auto text-xs rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">
                                {filtered.length}
                            </span>
                            <div className="relative">
                                <input
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder="Search by name…"
                                    className="h-9 w-48 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {/* search icon */}
                                <svg
                                    className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    aria-hidden="true"
                                >
                                    <path d="M21 21l-4.3-4.3M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </div>
                        </div>

                        {/* List (top 3) */}
                        {loading ? (
                            <ul className="divide-y divide-gray-100">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <li key={i} className="px-5 py-3">
                                        <div className="flex items-center justify-between">
                                            <div className="min-w-0 flex items-center gap-3">
                                                <div className="h-5 w-8 rounded bg-gray-200 animate-pulse" />
                                                <div className="h-4 w-40 rounded bg-gray-200 animate-pulse" />
                                                <div className="h-4 w-12 rounded bg-gray-200 animate-pulse" />
                                                <div className="h-4 w-14 rounded bg-gray-200 animate-pulse" />
                                            </div>
                                            <div className="h-4 w-14 rounded bg-gray-200 animate-pulse" />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : filtered.length === 0 ? (
                            <div className="p-6 text-sm text-gray-500">
                                {q ? 'No menus match your search.' : 'No menus found. Create your first one.'}
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {filtered.slice(0, 3).map((m, idx) => {
                                    const id = m._id || m.name;
                                    return (
                                        <li key={id}>
                                            <Link
                                                href={`/dashboard/websitehome/menus/${encodeURIComponent(id)}`}
                                                className="group flex items-center justify-between px-5 py-3 hover:bg-gray-50"
                                                title="View details"
                                            >
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="inline-flex items-center justify-center rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-700 ring-1 ring-inset ring-gray-200">#{(m.sortOrder ?? idx) + 1}</span>
                                                        <span className="truncate font-medium text-gray-900">{m.name}</span>
                                                        {/* badges */}
                                                        {m.showInNavbar ? (
                                                            <span className="rounded-md bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-700 ring-1 ring-inset ring-green-200">
                                                                Navbar
                                                            </span>
                                                        ) : (
                                                            <span className="rounded-md bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 ring-1 ring-inset ring-gray-200">
                                                                Hidden
                                                            </span>
                                                        )}
                                                        {m.type && (
                                                            <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 ring-1 ring-inset ring-blue-200">
                                                                {m.type}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {m.discover?.label && m.discover?.href && (
                                                        <p className="mt-0.5 truncate text-xs text-gray-500">
                                                            Discover: {m.discover.label} → {m.discover.href}
                                                        </p>
                                                    )}
                                                </div>

                                                <span className="inline-flex items-center gap-1 text-sm text-gray-500 group-hover:text-gray-700">
                                                    <Eye size={16} />
                                                    Details
                                                </span>
                                            </Link>
                                        </li>
                                    );
                                })}

                                <li>
                                    <Link
                                        href="/dashboard/websitehome/menus"
                                        title="View all menus"
                                        className="group flex items-center justify-between px-5 py-3 hover:bg-gray-50"
                                    >

                                        <span className="rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-600 group-hover:bg-white">
                                            View
                                        </span>
                                        <span className="font-semibold">Show All</span>
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </div>
                </section>

                {/* Right Section - Hero Text Management */}
                <section className="w-full lg:w-1/2">
                    {/* Header */}
                    {/* Header */}
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Hero Text</h1>
                            <p className="text-sm text-gray-500">Manage the main hero text, rotating lines, and features.</p>
                        </div>

                        <Link
                            href="/dashboard/websitehome/hero-text"   // NEW dedicated editor page
                            className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-white hover:bg-secondary/80"
                        >
                            <Edit size={18} />
                            Edit
                        </Link>
                    </div>

                    {/* Hero Text Card */}
                    <div className="rounded-2xl border-l-4 border border-gray-200 border-l-secondary bg-white shadow-md">
                        {heroLoading ? (
                            <div className="p-6">
                                {/* skeleton as you had */}
                                <div className="space-y-4">
                                    <div className="h-6 w-3/4 rounded bg-gray-200 animate-pulse" />
                                    <div className="space-y-2">
                                        <div className="h-4 w-1/2 rounded bg-gray-200 animate-pulse" />
                                        <div className="h-4 w-2/3 rounded bg-gray-200 animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 space-y-6">
                                {/* Main Title */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Main Title</h3>
                                    <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{heroText.mainTitle}</p>
                                </div>

                                {/* Rotating Lines */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Rotating Lines ({heroText.rotatingLines?.length || 0})</h3>
                                    <div className="space-y-2">
                                        {heroText.rotatingLines?.map((line, i) => (
                                            <div key={i} className="bg-gray-50 p-3 rounded-md">
                                                <span className="text-sm text-gray-600">#{i + 1}</span>
                                                <p className="text-gray-700 mt-1">{line}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Features Overview */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Features ({heroText.features?.length || 0})</h3>
                                    <ul className="space-y-2">
                                        {(heroText.features || []).sort((a, b) => (a?.sortOrder ?? 0) - (b?.sortOrder ?? 0)).map((f, i) => (
                                            <li key={i} className="flex items-center gap-2 bg-gray-50 p-3 rounded-md">
                                                <span className="text-xs text-gray-500">#{i + 1}</span>
                                                <span className="text-xs text-gray-500">[{f.icon}]</span>
                                                <span className="text-gray-700">{f.text}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Video Management Section */}
            <section className="mt-8">
                <div className="mx-auto w-full pb-6 space-y-4">
                    <h1 className="text-xl font-semibold">Review Videos Header</h1>
                    {videoLoading ? (
                        <></>
                    ) : (
                        <div className='flex gap-4'>
                            <input
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                className="w-full rounded border p-2"
                            />
                            <button
                                onClick={save}
                                disabled={saving}
                                className="rounded-xl bg-secondary px-4 py-2 text-white disabled:opacity-50"
                            >
                                {saving ? "Saving…" : "Save"}
                            </button>
                        </div>
                    )}
                </div>
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Review Videos</h1>
                        <p className="text-sm text-gray-500">Manage customer review videos and their content.</p>
                    </div>
                    {!isEditingVideo && (
                        <button
                            onClick={() => startEditingVideo()}
                            className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-white hover:bg-secondary/80"
                        >
                            <Plus size={18} />
                            Add Video
                        </button>
                    )}
                </div>

                {/* Video Management Card */}
                <div className="rounded-2xl border-l-4 border border-gray-200 border-l-secondary bg-white shadow-md">
                    {videoLoading ? (
                        <div className="p-6">
                            <div className="space-y-4">
                                {Array.from({ length: 2 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className="h-20 w-32 rounded bg-gray-200 animate-pulse" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 w-3/4 rounded bg-gray-200 animate-pulse" />
                                            <div className="h-3 w-1/2 rounded bg-gray-200 animate-pulse" />
                                            <div className="h-3 w-2/3 rounded bg-gray-200 animate-pulse" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : isEditingVideo ? (
                        <div className="p-6 space-y-6">
                            {/* Video Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Video File
                                </label>
                                <VideoUpload
                                    file={editingVideo.srcMp4}
                                    onUploadComplete={(url) => setEditingVideo(prev => ({ ...prev, srcMp4: url }))}
                                    onDelete={() => setEditingVideo(prev => ({ ...prev, srcMp4: '' }))}
                                />
                            </div>

                            {/* Video Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={editingVideo.title}
                                        onChange={(e) => setEditingVideo(prev => ({ ...prev, title: e.target.value }))}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., Down 18% in 4 months"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Subtitle
                                    </label>
                                    <input
                                        type="text"
                                        value={editingVideo.subtitle}
                                        onChange={(e) => setEditingVideo(prev => ({ ...prev, subtitle: e.target.value }))}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., Semaglutide · Ayesha"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={editingVideo.description}
                                    onChange={(e) => setEditingVideo(prev => ({ ...prev, description: e.target.value }))}
                                    rows={3}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Customer review description..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Poster Image
                                </label>
                                <UploadMediaLite
                                    file={editingVideo.poster}
                                    onUploadComplete={(url) => setEditingVideo(prev => ({ ...prev, poster: url }))}
                                    onDelete={() => setEditingVideo(prev => ({ ...prev, poster: '' }))}
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-4">
                                <button
                                    onClick={saveVideo}
                                    className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                                >
                                    <Save size={16} />
                                    Save Video
                                </button>
                                <button
                                    onClick={cancelEditingVideo}
                                    className="inline-flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                                >
                                    <X size={16} />
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : videos.length === 0 ? (
                        <div className="p-6 text-sm text-gray-500">
                            No videos found. Add your first review video.
                        </div>
                    ) : (
                        <div className="p-6">
                            <div className="space-y-4">
                                {videos.map((video, index) => (
                                    <div key={video._id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                                        {/* Video Thumbnail */}
                                        <div className="relative w-20 h-16 bg-gray-100 rounded overflow-hidden">
                                            {video.poster ? (
                                                <Image
                                                    src={video.poster}
                                                    alt={video.title}
                                                    width={800}     // you can adjust
                                                    height={450}    // you can adjust
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Play size={24} className="text-gray-400" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Video Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-gray-900 truncate">{video.title}</h3>
                                            <p className="text-sm text-gray-500 truncate">{video.subtitle}</p>
                                            <p className="text-xs text-gray-400 truncate">{video.description}</p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => startEditingVideo(video)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                                title="Edit video"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => deleteVideo(video._id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                                                title="Delete video"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Reviews Preview Section */}
            <section className="mt-8">
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Customer Reviews</h1>
                        <p className="text-sm text-gray-500">Preview customer reviews and testimonials.</p>
                    </div>
                    <Link
                        href="/dashboard/websitehome/reviews"
                        className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-white hover:bg-secondary/80"
                    >
                        <Eye size={18} />
                        Manage Reviews
                    </Link>
                </div>

                {/* Reviews Preview Card */}
                <div className="rounded-2xl border-l-4 border border-gray-200 border-l-secondary bg-white shadow-md">
                    {reviewLoading ? (
                        <div className="p-6">
                            <div className="space-y-4">
                                {Array.from({ length: 2 }).map((_, i) => (
                                    <div key={i} className="p-4 border border-gray-200 rounded-lg">
                                        <div className="space-y-2">
                                            <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
                                            <div className="h-4 w-3/4 rounded bg-gray-200 animate-pulse" />
                                            <div className="h-4 w-1/2 rounded bg-gray-200 animate-pulse" />
                                        </div>
                                        <div className="mt-3 flex items-center gap-2">
                                            <div className="h-4 w-20 rounded bg-gray-200 animate-pulse" />
                                            <div className="h-4 w-16 rounded bg-gray-200 animate-pulse" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="p-6 text-sm text-gray-500">
                            No reviews found. Add your first customer review.
                        </div>
                    ) : (
                        <div className="p-6">
                            <div className="space-y-4">
                                {reviews.slice(0, 3).map((review, index) => (
                                    <div key={review._id} className="p-4 border border-gray-200 rounded-lg">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <span className="text-blue-600 font-semibold text-sm">
                                                        {review.author.charAt(0)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-gray-800 text-sm leading-relaxed">
                                                    {review.quote}
                                                </p>
                                                <div className="mt-2 flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        {review.author}
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <svg key={i} viewBox="0 0 24 24" className="h-4 w-4 fill-yellow-400">
                                                                <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.401 8.168L12 18.896 4.665 23.165l1.401-8.168L.132 9.21l8.2-1.192L12 .587z" />
                                                            </svg>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {reviews.length > 3 && (
                                    <div className="text-center pt-2">
                                        <span className="text-sm text-gray-500">
                                            And {reviews.length - 3} more reviews...
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* BMI Calculator & Compounded GLP-1 Management Section */}
            <section className="mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* BMI Calculator Management - Left */}
                    <div>
                        {/* Header */}
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">BMI Calculator</h1>
                                <p className="text-sm text-gray-500">Manage BMI calculator title, description, and image.</p>
                            </div>
                            {!isEditingBmi && (
                                <button
                                    onClick={startEditingBmi}
                                    className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-white hover:bg-secondary/80"
                                >
                                    <Edit size={18} />
                                    Edit
                                </button>
                            )}
                        </div>

                        {/* BMI Content Card */}
                        <div className="rounded-2xl border-l-4 border border-gray-200 border-l-secondary bg-white shadow-md">
                            {bmiLoading ? (
                                <div className="p-6">
                                    <div className="space-y-4">
                                        <div className="h-6 w-3/4 rounded bg-gray-200 animate-pulse" />
                                        <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
                                        <div className="h-4 w-2/3 rounded bg-gray-200 animate-pulse" />
                                        <div className="h-32 w-full rounded bg-gray-200 animate-pulse" />
                                    </div>
                                </div>
                            ) : isEditingBmi ? (
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            value={editingBmi.title}
                                            onChange={(e) => setEditingBmi(prev => ({ ...prev, title: e.target.value }))}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter title..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            value={editingBmi.description}
                                            onChange={(e) => setEditingBmi(prev => ({ ...prev, description: e.target.value }))}
                                            rows={3}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter description..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Image
                                        </label>

                                        {/* Toggle between upload and URL input */}
                                        <div className="mb-3 flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setShowBmiImageUpload(!showBmiImageUpload)}
                                                className={`px-3 py-1 text-sm rounded-md transition ${showBmiImageUpload
                                                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                                    : 'bg-gray-100 text-gray-700 border border-gray-300'
                                                    }`}
                                            >
                                                {showBmiImageUpload ? 'Switch to URL' : 'Upload Image'}
                                            </button>
                                        </div>

                                        {showBmiImageUpload ? (
                                            <div>
                                                <UploadMediaLite
                                                    file={editingBmi.image}
                                                    onUploadComplete={(url) => setEditingBmi(prev => ({ ...prev, image: url }))}
                                                    onDelete={() => setEditingBmi(prev => ({ ...prev, image: '' }))}
                                                />
                                            </div>
                                        ) : (
                                            <input
                                                type="url"
                                                value={editingBmi.image}
                                                onChange={(e) => setEditingBmi(prev => ({ ...prev, image: e.target.value }))}
                                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="https://example.com/image.jpg"
                                            />
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 pt-4">
                                        <button
                                            onClick={saveBmiContent}
                                            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                                        >
                                            <Save size={16} />
                                            Save
                                        </button>
                                        <button
                                            onClick={cancelEditingBmi}
                                            className="inline-flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                                        >
                                            <X size={16} />
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6">
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Title</h3>
                                            <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                                                {bmiContent.title}
                                            </p>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                                            <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                                                {bmiContent.description}
                                            </p>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Image</h3>

                                            <div className="bg-gray-50 p-3 rounded-md">
                                                <div className="relative h-32 w-32 overflow-hidden rounded-lg">
                                                    <Image
                                                        src={bmiContent.image}
                                                        alt="BMI Calculator"
                                                        fill                              // fills the parent box
                                                        sizes="40px"
                                                        className="object-contain"        // show full image without cropping
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Compounded GLP-1 Management - Right */}
                    <div>
                        {/* Header */}
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">Compounded GLP-1</h1>
                                <p className="text-sm text-gray-500">Manage compounded GLP-1 title, description, and image.</p>
                            </div>
                            {!isEditingCompounded && (
                                <button
                                    onClick={startEditingCompounded}
                                    className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-white hover:bg-secondary/80"
                                >
                                    <Edit size={18} />
                                    Edit
                                </button>
                            )}
                        </div>

                        {/* Compounded Content Card */}
                        <div className="rounded-2xl border-l-4 border border-gray-200 border-l-secondary bg-white shadow-md">
                            {compoundedLoading ? (
                                <div className="p-6">
                                    <div className="space-y-4">
                                        <div className="h-6 w-3/4 rounded bg-gray-200 animate-pulse" />
                                        <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
                                        <div className="h-4 w-2/3 rounded bg-gray-200 animate-pulse" />
                                        <div className="h-32 w-full rounded bg-gray-200 animate-pulse" />
                                    </div>
                                </div>
                            ) : isEditingCompounded ? (
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            value={editingCompounded.title}
                                            onChange={(e) => setEditingCompounded(prev => ({ ...prev, title: e.target.value }))}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter title..."
                                        />
                                    </div>

                                    {/* Tabs editor */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Tabs ({editingCompounded.tabs.length})
                                            </label>
                                            <button
                                                onClick={() => setEditingCompounded(prev => ({ ...prev, tabs: [...prev.tabs, { icon: 'Beaker', subtitle: '', description: '' }] }))}
                                                className="text-xs text-blue-600 hover:text-blue-700"
                                            >
                                                + Add Tab
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {editingCompounded.tabs.map((t, i) => (
                                                <div key={i} className="border border-gray-200 rounded-lg p-3">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-medium text-gray-900">Tab {i + 1}</span>
                                                        <button
                                                            onClick={() => setEditingCompounded(prev => ({ ...prev, tabs: prev.tabs.filter((_, idx) => idx !== i) }))}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-1">Icon</label>
                                                            <Select
                                                                value={t.icon || ""}
                                                                onValueChange={(value) => setEditingCompounded(prev => ({ ...prev, tabs: prev.tabs.map((tab, idx) => idx === i ? { ...tab, icon: value } : tab) }))}
                                                            >
                                                                <SelectTrigger className="mt-1">
                                                                    <SelectValue
                                                                        placeholder="Select an icon"
                                                                        renderValue={(selected) => {
                                                                            const option = COMPOUNDED_ICON_OPTIONS.find((o) => o.value === selected);
                                                                            if (!option) return "Select an icon";
                                                                            const Icon = LucideIcons[option.value];
                                                                            return (
                                                                                <div className="flex items-center gap-2">
                                                                                    {Icon && <Icon className="h-4 w-4" />}
                                                                                    <span>{option.label}</span>
                                                                                </div>
                                                                            );
                                                                        }}
                                                                    />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {COMPOUNDED_ICON_OPTIONS.map((option) => {
                                                                        const Icon = LucideIcons[option.value];
                                                                        return (
                                                                            <SelectItem key={option.value} value={option.value}>
                                                                                <div className="flex items-center gap-2">
                                                                                    {Icon && <Icon className="h-4 w-4" />}
                                                                                    <span>{option.label}</span>
                                                                                </div>
                                                                            </SelectItem>
                                                                        );
                                                                    })}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <label className="block text-xs font-medium text-gray-600 mb-1">Subtitle</label>
                                                            <input
                                                                type="text"
                                                                value={t.subtitle}
                                                                onChange={(e) => setEditingCompounded(prev => ({ ...prev, tabs: prev.tabs.map((tab, idx) => idx === i ? { ...tab, subtitle: e.target.value } : tab) }))}
                                                                className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                placeholder="e.g., Provider-Prescribed"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="mt-2">
                                                        <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                                                        <textarea
                                                            rows={3}
                                                            value={t.description}
                                                            onChange={(e) => setEditingCompounded(prev => ({ ...prev, tabs: prev.tabs.map((tab, idx) => idx === i ? { ...tab, description: e.target.value } : tab) }))}
                                                            className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder="Detail for this tab"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Image
                                        </label>

                                        {/* Toggle between upload and URL input */}
                                        <div className="mb-3 flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setShowCompoundedImageUpload(!showCompoundedImageUpload)}
                                                className={`px-3 py-1 text-sm rounded-md transition ${showCompoundedImageUpload
                                                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                                    : 'bg-gray-100 text-gray-700 border border-gray-300'
                                                    }`}
                                            >
                                                {showCompoundedImageUpload ? 'Switch to URL' : 'Upload Image'}
                                            </button>
                                        </div>

                                        {showCompoundedImageUpload ? (
                                            <div>
                                                <UploadMediaLite
                                                    file={editingCompounded.image}
                                                    onUploadComplete={(url) => setEditingCompounded(prev => ({ ...prev, image: url }))}
                                                    onDelete={() => setEditingCompounded(prev => ({ ...prev, image: '' }))}
                                                />
                                            </div>
                                        ) : (
                                            <input
                                                type="url"
                                                value={editingCompounded.image}
                                                onChange={(e) => setEditingCompounded(prev => ({ ...prev, image: e.target.value }))}
                                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="https://example.com/image.jpg"
                                            />
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 pt-4">
                                        <button
                                            onClick={saveCompoundedContent}
                                            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                                        >
                                            <Save size={16} />
                                            Save
                                        </button>
                                        <button
                                            onClick={cancelEditingCompounded}
                                            className="inline-flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                                        >
                                            <X size={16} />
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6">
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Title</h3>
                                            <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                                                {compoundedContent.title}
                                            </p>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tabs ({compoundedContent.tabs?.length || 0})</h3>
                                            <div className="space-y-2">
                                                {compoundedContent.tabs?.map((tab, index) => (
                                                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-500">#{index + 1}</span>
                                                            <span className="text-sm font-medium text-gray-900">{tab.subtitle}</span>
                                                            {tab.icon && (
                                                                <span className="text-xs text-gray-500">({tab.icon})</span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-700 mt-1">{tab.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Image</h3>
                                            <div className="bg-gray-50 p-3 rounded-md">
                                                <div className="relative h-32 w-32 overflow-hidden rounded-lg">
                                                    <Image
                                                        src={compoundedContent.image}
                                                        alt="Compounded GLP-1"
                                                        fill                              // fills the parent box
                                                        sizes="40px"
                                                        className="object-contain"        // show full image without cropping
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works & Results Preview Section */}
            <section className="mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* How It Works Preview - Left */}
                    <div>
                        {/* Header */}
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">How It Works</h1>
                                <p className="text-sm text-gray-500">Preview and manage the How It Works section content.</p>
                            </div>
                            <Link
                                href="/dashboard/websitehome/howitworks"
                                className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-white hover:bg-secondary/80"
                            >
                                <Eye size={18} />
                                Manage
                            </Link>
                        </div>

                        {/* How It Works Preview Card */}
                        <div className="rounded-2xl border-l-4 border border-gray-200 border-l-secondary bg-white shadow-md">
                            {howItWorksLoading ? (
                                <div className="p-6">
                                    <div className="space-y-4">
                                        <div className="h-6 w-3/4 rounded bg-gray-200 animate-pulse" />
                                        <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
                                        <div className="h-4 w-2/3 rounded bg-gray-200 animate-pulse" />
                                        <div className="space-y-2">
                                            {Array.from({ length: 3 }).map((_, i) => (
                                                <div key={i} className="h-20 w-full rounded bg-gray-200 animate-pulse" />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6">
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Main Title</h3>
                                            <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                                                {howItWorksContent.mainTitle}
                                            </p>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Steps ({howItWorksContent.steps?.length || 0})</h3>
                                            <div className="space-y-2">
                                                {howItWorksContent.steps?.slice(0, 2).map((step, index) => (
                                                    <div key={index} className="bg-gray-50 p-3 rounded-md">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                                                            <span className="text-sm font-semibold text-gray-900">{step.title}</span>
                                                        </div>
                                                        <p className="text-xs text-gray-600">{step.description}</p>
                                                    </div>
                                                ))}
                                                {howItWorksContent.steps?.length > 2 && (
                                                    <div className="text-center pt-2">
                                                        <span className="text-sm text-gray-500">
                                                            And {howItWorksContent.steps.length - 2} more steps...
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">CTA Button</h3>
                                            <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                                                {howItWorksContent.ctaText} → {howItWorksContent.ctaLink}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Results Preview - Right */}
                    <div>
                        {/* Header */}
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">Results</h1>
                                <p className="text-sm text-gray-500">Preview and manage the Results section content.</p>
                            </div>
                            <Link
                                href="/dashboard/websitehome/results"
                                className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-white hover:bg-secondary/80"
                            >
                                <Eye size={18} />
                                Manage
                            </Link>
                        </div>

                        {/* Results Preview Card */}
                        <div className="rounded-2xl border-l-4 border border-gray-200 border-l-secondary bg-white shadow-md">
                            {resultsLoading ? (
                                <div className="p-6">
                                    <div className="space-y-4">
                                        <div className="h-6 w-3/4 rounded bg-gray-200 animate-pulse" />
                                        <div className="space-y-2">
                                            {Array.from({ length: 3 }).map((_, i) => (
                                                <div key={i} className="h-16 w-full rounded bg-gray-200 animate-pulse" />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6">
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tabs ({resultsContent.tabs?.length || 0})</h3>
                                            <div className="space-y-2">
                                                {resultsContent.tabs?.slice(0, 2).map((tab, index) => (
                                                    <div key={index} className="bg-gray-50 p-3 rounded-md">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                                                            <span className="text-sm font-semibold text-gray-900">{tab.title}</span>
                                                        </div>
                                                        <p className="text-xs text-gray-600">{tab.body}</p>
                                                        <div className="mt-2 flex flex-wrap gap-1">
                                                            {tab.bullets?.slice(0, 2).map((bullet, bulletIndex) => (
                                                                <span key={bulletIndex} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                                                    {bullet}
                                                                </span>
                                                            ))}
                                                            {tab.bullets?.length > 2 && (
                                                                <span className="text-xs text-gray-500">
                                                                    +{tab.bullets.length - 2} more
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                                {resultsContent.tabs?.length > 2 && (
                                                    <div className="text-center pt-2">
                                                        <span className="text-sm text-gray-500">
                                                            And {resultsContent.tabs.length - 2} more tabs...
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Watermark</h3>
                                            <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                                                Text: {resultsContent.watermark?.text} | Size: {resultsContent.watermark?.size}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
