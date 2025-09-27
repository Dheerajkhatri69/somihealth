// app/dashboard/gh/page.jsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Activity, FileText, Pencil, ExternalLink, Plus, Loader2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

function SectionCard({ title, right, children }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">{title}</h2>
                {right}
            </div>
            <div className="px-4 sm:px-6 py-4">{children}</div>
        </div>
    );
}
function StatTile({ icon, label, value, sub }) {
    return (
        <div className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 bg-white">
            <div className="mt-0.5">{icon}</div>
            <div className="min-w-0">
                <div className="text-sm text-slate-600">{label}</div>
                <div className="text-xl font-semibold text-slate-900">{value}</div>
                {sub && <div className="text-xs text-slate-500">{sub}</div>}
            </div>
        </div>
    );
}
function SkeletonLine({ w = '100%', h = '1rem' }) {
    return <div className="bg-slate-200 rounded animate-pulse" style={{ width: w, height: h }} />;
}
function ListSkeleton() {
    return (
        <div className="space-y-3">
            <SkeletonLine w="80%" />
            <SkeletonLine w="60%" />
            <SkeletonLine w="90%" />
        </div>
    );
}

export default function GHDashboardOverview() {
    const [loading, setLoading] = useState(true);
    const [ghMain, setGhMain] = useState(null);     // from /api/gh-content
    const [ghEntries, setGhEntries] = useState([]); // from /api/gh-entries

    const loadData = async () => {
        setLoading(true);
        try {
            // GH Main Page content
            const ghMainRes = await fetch('/api/gh-content', { cache: 'no-store' });
            const ghMainJson = await ghMainRes.json().catch(() => ({}));
            if (!ghMainJson?.success) throw new Error(ghMainJson?.message || 'Failed to load GH main page');
            setGhMain(ghMainJson.result);

            // GH entries list
            const ghListRes = await fetch('/api/gh-entries', { cache: 'no-store' });
            const ghListJson = await ghListRes.json().catch(() => ({}));
            if (!ghListJson?.success) throw new Error(ghListJson?.message || 'Failed to load GH entries');
            setGhEntries(ghListJson.result || []);
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Failed to load overview');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const totalGh = ghEntries.length;
    const latest = ghEntries?.[0];
    const latestWhen = latest?.updatedAt ? new Date(latest.updatedAt).toLocaleString() : '—';
    const ghMainUpdated = ghMain?.updatedAt ? new Date(ghMain.updatedAt).toLocaleString() : '—';

    return (
        <div className="w-full mx-auto max-w-7xl p-4 space-y-6">

            {/* Header */}
            <div className="flex flex-col mb-6 sm:flex-row sm:items-end sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">General Health — Overview</h1>
                    <p className="text-slate-600">Snapshot of GH main page and GH condition entries.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={loadData}
                        className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                        <Activity className="w-4 h-4 mr-2" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading ? (
                    <>
                        <div className="rounded-xl border border-slate-200 p-4 bg-white"><ListSkeleton /></div>
                        <div className="rounded-xl border border-slate-200 p-4 bg-white"><ListSkeleton /></div>
                    </>
                ) : (
                    <>
                        <StatTile
                            icon={<FileText className="w-5 h-5 text-slate-600" />}
                            label="GH Main Page"
                            value={ghMain?.hero?.heading || '—'}
                            sub={`Last updated: ${ghMainUpdated}`}
                        />
                        <StatTile
                            icon={<Activity className="w-5 h-5 text-slate-600" />}
                            label="GH Condition Entries"
                            value={`${totalGh} entr${totalGh === 1 ? 'y' : 'ies'}`}
                            sub={latest ? `Latest: ${latest.slug} • ${latestWhen}` : '—'}
                        />
                    </>
                )}
            </div>

            {/* GH Main Page */}
            <SectionCard
                title="GH Main Page"
                right={
                    <div className="flex gap-2">
                        {/* View the public GH page (adjust if needed) */}
                        <a
                            href="/underdevelopmentmainpage/general-health"
                            target="_blank"
                            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                            <ExternalLink className="w-4 h-4" />
                            View
                        </a>
                        {/* Link to your GH main editor (adjust to your route) */}
                        <Link
                            href="/dashboard/gh-content/gh-mainpage"
                            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 text-white px-3 py-2 text-sm hover:opacity-95"
                        >
                            <Pencil className="w-4 h-4" />
                            Manage
                        </Link>
                    </div>
                }
            >
                {loading ? (
                    <ListSkeleton />
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2">
                            <div className="text-sm text-slate-600">Hero heading</div>
                            <div className="text-base font-medium text-slate-900">
                                {ghMain?.hero?.heading || '—'}
                            </div>
                            <div className="mt-2 text-sm text-slate-600">
                                Subheading: <span className="text-slate-900">{ghMain?.hero?.subheading || '—'}</span>
                            </div>
                        </div>
                        <div className="border rounded-xl p-3 bg-slate-50">
                            <div className="text-sm text-slate-600">Quick Actions</div>
                            <div className="mt-2 flex flex-wrap gap-2">
                                <Link href="/dashboard/gh-content/gh-mainpage" className="px-3 py-1.5 rounded-lg border text-sm hover:bg-white">Edit Content</Link>
                                <a href="/underdevelopmentmainpage/general-health" target="_blank" className="px-3 py-1.5 rounded-lg border text-sm hover:bg-white">Preview</a>
                            </div>
                        </div>
                    </div>
                )}
            </SectionCard>

            {/* GH Entries */}
            <SectionCard
                title="GH Condition Entries"
                right={
                    <Link
                        href="/dashboard/gh-content/gh-entries"
                        className="inline-flex items-center gap-2 rounded-lg bg-slate-900 text-white px-3 py-2 text-sm hover:opacity-95"
                    >
                        <Pencil className="w-4 h-4" />
                        Manage
                    </Link>
                }
            >
                {loading ? (
                    <ListSkeleton />
                ) : ghEntries.length === 0 ? (
                    <div className="text-sm text-slate-500">No entries created yet. Click “Manage” to add your first entry.</div>
                ) : (
                    <div className="space-y-2">
                        {ghEntries.slice(0, 6).map((r) => (
                            <div key={r._id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3">
                                <div className="min-w-0">
                                    <div className="font-medium text-slate-900 truncate">{r.slug}</div>
                                    <div className="text-xs text-slate-500 truncate">{r?.context?.subHero?.heading || '—'}</div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Link href={`/dashboard/gh-content/gh-entries`} className="px-3 py-1.5 rounded-lg border text-sm hover:bg-slate-50">Edit</Link>
                                    <a
                                        href={`/underdevelopmentmainpage/general-health/${r.slug}`}
                                        target="_blank"
                                        className="px-3 py-1.5 rounded-lg border text-sm hover:bg-slate-50"
                                    >
                                        View
                                    </a>
                                </div>
                            </div>
                        ))}
                        {ghEntries.length > 6 && (
                            <div className="pt-2">
                                <Link href="/dashboard/gh-content/gh-entries" className="text-sm text-slate-700 hover:underline">See all entries →</Link>
                            </div>
                        )}
                    </div>
                )}
            </SectionCard>

            {/* Mobile refresh */}
            <div className="lg:hidden">
                <button
                    onClick={loadData}
                    className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                    <Loader2 className="w-4 h-4 mr-2" />
                    Refresh Data
                </button>
            </div>
        </div>
    );
}
