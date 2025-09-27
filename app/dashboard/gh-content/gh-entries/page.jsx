'use client';

import { useEffect, useMemo, useState } from "react";
import { Save, Plus, Trash2, Loader2 } from "lucide-react";
import UploadMediaLite from "@/components/UploadMediaLite";
import toast, { Toaster } from "react-hot-toast";

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

function Label({ children }) {
    return <label className="text-sm font-medium text-slate-700">{children}</label>;
}

function Input(props) {
    return (
        <input
            {...props}
            className={`mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900/20 outline-none ${props.className || ""}`}
        />
    );
}

function TextArea(props) {
    return (
        <textarea
            {...props}
            className={`mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900/20 outline-none ${props.className || ""}`}
        />
    );
}

function SkeletonLine({ w = "100%", h = "1rem" }) {
    return <div className="bg-slate-200 rounded animate-pulse" style={{ width: w, height: h }} />;
}

function ListSkeleton() {
    return (
        <div className="space-y-3">
            <SkeletonLine w="70%" />
            <SkeletonLine w="50%" />
            <SkeletonLine w="85%" />
        </div>
    );
}

export default function GHEntriesDashboard() {
    const [rows, setRows] = useState([]);
    const [slug, setSlug] = useState("");
    const [entry, setEntry] = useState({
        slug: "",
        context: {
            subHero: { eyebrow: "", heading: "", subheading: "", ctaLabel: "", ctaHref: "", priceNote: "", disclaimer: "", image: { src: "", alt: "", width: 520, height: 520 } },
            steps: { heading: "", steps: [] },
            treatment: { heading: "", intro: "", items: [] },
            sections: []
        },
        config: { isActive: true }
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [creating, setCreating] = useState(false);
    const [deletingSlug, setDeletingSlug] = useState("");

    const loadList = async () => {
        setLoading(true);
        try {
            const r = await fetch("/api/gh-entries", { cache: "no-store" });
            const j = await r.json();
            if (!j?.success) throw new Error(j?.message || "Failed to list entries");
            setRows(j.result || []);
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Failed to load entries");
        } finally {
            setLoading(false);
        }
    };

    const loadOne = async (s) => {
        try {
            const r = await fetch(`/api/gh-entries/${s}`, { cache: "no-store" });
            const j = await r.json();
            if (!j?.success) throw new Error(j?.message || "Not found");
            setEntry(j.result);
            setSlug(s);
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Failed to load entry");
        }
    };

    const createNew = async () => {
        if (!slug.trim()) {
            toast.error("Please enter a slug");
            return;
        }
        try {
            setCreating(true);
            const res = await fetch("/api/gh-entries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slug: slug.trim(), context: entry.context, config: entry.config })
            });
            const j = await res.json();
            if (!j?.success) throw new Error(j?.message || "Create failed");
            toast.success("Entry created");
            await loadList();
            await loadOne(slug.trim());
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Failed to create entry");
        } finally {
            setCreating(false);
        }
    };

    const save = async () => {
        const targetSlug = entry.slug || slug;
        if (!targetSlug?.trim()) {
            toast.error("Slug is required");
            return;
        }
        try {
            setSaving(true);
            const res = await fetch(`/api/gh-entries/${targetSlug.trim()}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ context: entry.context, config: entry.config })
            });
            const j = await res.json();
            if (!j?.success) throw new Error(j?.message || "Update failed");
            setEntry(j.result);
            toast.success("Entry updated");
            await loadList();
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Failed to update entry");
        } finally {
            setSaving(false);
        }
    };

    const remove = async (s) => {
        const ok = confirm(`Delete "${s}"? This cannot be undone.`);
        if (!ok) return;
        try {
            setDeletingSlug(s);
            const res = await fetch(`/api/gh-entries/${s}`, { method: "DELETE" });
            const j = await res.json().catch(() => ({}));
            if (j?.success === false) throw new Error(j?.message || "Delete failed");
            toast.success("Entry deleted");
            if (slug === s) {
                setEntry(prev => ({ ...prev, slug: "" }));
                setSlug("");
            }
            await loadList();
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Failed to delete entry");
        } finally {
            setDeletingSlug("");
        }
    };

    useEffect(() => { loadList(); }, []);

    // small helper values
    const steps = entry.context.steps.steps || [];
    const treatItems = entry.context.treatment.items || [];
    const sections = entry.context.sections || [];

    return (
        <div className="w-full mx-auto max-w-7xl p-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-10">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">General Health Entries</h1>
                    <p className="text-slate-600">Create and edit `/general-health/[slug]` content.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={save}
                        disabled={saving}
                        className="inline-flex items-center justify-center rounded-lg bg-slate-900 text-white px-4 py-2 text-sm hover:opacity-95 disabled:opacity-60"
                    >
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>

            {/* Row: List (left) + Editor (right) */}
            <div className="flex flex-col gap-6">
                {/* LIST */}
                <div>
                    <SectionCard
                        title="Entries"
                        right={
                            <div className="flex items-center gap-2">
                                <Input
                                    placeholder="new slug e.g. diabetes"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    className="w-40 sm:w-56"
                                />
                                <button
                                    onClick={createNew}
                                    disabled={creating}
                                    className="inline-flex items-center gap-2 rounded-lg bg-slate-900 text-white px-3 py-2 text-sm hover:opacity-95 disabled:opacity-60"
                                >
                                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    {creating ? "Creating..." : "Create"}
                                </button>
                            </div>
                        }
                    >
                        <div className="max-h-[28rem] overflow-auto divide-y">
                            {loading ? (
                                <div className="py-3"><ListSkeleton /></div>
                            ) : rows.length === 0 ? (
                                <div className="py-6 text-sm text-slate-500">No entries yet. Create one using the slug field above.</div>
                            ) : (
                                rows.map((r) => (
                                    <div key={r._id} className="py-3 flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="font-medium truncate">{r.slug}</div>
                                            <div className="text-xs text-slate-500 truncate">{r?.context?.subHero?.heading}</div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                onClick={() => loadOne(r.slug)}
                                                className="px-3 py-1.5 rounded-lg border text-sm hover:bg-slate-50"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => remove(r.slug)}
                                                disabled={deletingSlug === r.slug}
                                                className="px-3 py-1.5 rounded-lg border text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
                                            >
                                                {deletingSlug === r.slug ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </SectionCard>
                </div>

                {/* EDITOR */}
                <div>
                    <div className="space-y-6">
                        {/* Meta */}
                        <SectionCard title="Meta">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label>Slug</Label>
                                    <Input
                                        value={entry.slug || slug}
                                        onChange={(e) => setEntry((p) => ({ ...p, slug: e.target.value }))}
                                        placeholder="high-blood-pressure"
                                    />
                                </div>
                                <div>
                                    <Label>Active</Label>
                                    <select
                                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900/20 outline-none"
                                        value={entry?.config?.isActive ? "1" : "0"}
                                        onChange={(e) => setEntry((p) => ({ ...p, config: { ...p.config, isActive: e.target.value === "1" } }))}
                                    >
                                        <option value="1">true</option>
                                        <option value="0">false</option>
                                    </select>
                                </div>
                            </div>
                        </SectionCard>

                        {/* SubHero */}
                        <SectionCard title="SubHero">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label>Eyebrow</Label>
                                    <Input
                                        placeholder="Small eyebrow text"
                                        value={entry.context.subHero.eyebrow}
                                        onChange={(e) => setEntry((p) => ({ ...p, context: { ...p.context, subHero: { ...p.context.subHero, eyebrow: e.target.value } } }))}
                                    />
                                </div>
                                <div>
                                    <Label>Heading</Label>
                                    <Input
                                        placeholder="Main title"
                                        value={entry.context.subHero.heading}
                                        onChange={(e) => setEntry((p) => ({ ...p, context: { ...p.context, subHero: { ...p.context.subHero, heading: e.target.value } } }))}
                                    />
                                </div>
                                <div>
                                    <Label>CTA Label</Label>
                                    <Input
                                        placeholder="Get started"
                                        value={entry.context.subHero.ctaLabel}
                                        onChange={(e) => setEntry((p) => ({ ...p, context: { ...p.context, subHero: { ...p.context.subHero, ctaLabel: e.target.value } } }))}
                                    />
                                </div>
                                <div>
                                    <Label>CTA Href</Label>
                                    <Input
                                        placeholder="/get-started"
                                        value={entry.context.subHero.ctaHref}
                                        onChange={(e) => setEntry((p) => ({ ...p, context: { ...p.context, subHero: { ...p.context.subHero, ctaHref: e.target.value } } }))}
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
                                <Label>Subheading</Label>
                                <TextArea
                                    rows={3}
                                    placeholder="Short description under the heading"
                                    value={entry.context.subHero.subheading}
                                    onChange={(e) => setEntry((p) => ({ ...p, context: { ...p.context, subHero: { ...p.context.subHero, subheading: e.target.value } } }))}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <Label>Price Note</Label>
                                    <Input
                                        placeholder="$75/month, cancel anytime"
                                        value={entry.context.subHero.priceNote}
                                        onChange={(e) => setEntry((p) => ({ ...p, context: { ...p.context, subHero: { ...p.context.subHero, priceNote: e.target.value } } }))}
                                    />
                                </div>
                                <div>
                                    <Label>Disclaimer</Label>
                                    <Input
                                        placeholder="Important disclaimer..."
                                        value={entry.context.subHero.disclaimer}
                                        onChange={(e) => setEntry((p) => ({ ...p, context: { ...p.context, subHero: { ...p.context.subHero, disclaimer: e.target.value } } }))}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <Label>Hero Image</Label>
                                    <div className="mt-2">
                                        <UploadMediaLite
                                            file={entry.context.subHero.image?.src}
                                            onUploadComplete={(url) => setEntry((p) => ({ ...p, context: { ...p.context, subHero: { ...p.context.subHero, image: { ...p.context.subHero.image, src: url } } } }))}
                                            onDelete={() => setEntry((p) => ({ ...p, context: { ...p.context, subHero: { ...p.context.subHero, image: { ...p.context.subHero.image, src: "" } } } }))}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label>Image Alt</Label>
                                    <Input
                                        placeholder="Person jogging"
                                        value={entry.context.subHero.image?.alt}
                                        onChange={(e) => setEntry((p) => ({ ...p, context: { ...p.context, subHero: { ...p.context.subHero, image: { ...p.context.subHero.image, alt: e.target.value } } } }))}
                                    />
                                </div>
                            </div>
                        </SectionCard>

                        {/* Steps */}
                        <SectionCard
                            title="Steps"
                            right={
                                <button
                                    className="px-3 py-2 rounded-lg bg-slate-900 text-white text-sm hover:opacity-95"
                                    onClick={() =>
                                        setEntry((p) => ({
                                            ...p,
                                            context: { ...p.context, steps: { ...p.context.steps, steps: [...(p.context.steps.steps || []), { title: "Step", desc: "..." }] } }
                                        }))
                                    }
                                >
                                    + Add Step
                                </button>
                            }
                        >
                            <div className="mb-4">
                                <Label>Steps Heading</Label>
                                <Input
                                    placeholder="How it works"
                                    value={entry.context.steps.heading}
                                    onChange={(e) => setEntry((p) => ({ ...p, context: { ...p.context, steps: { ...p.context.steps, heading: e.target.value } } }))}
                                />
                            </div>

                            <div className="space-y-4">
                                {steps.map((s, i) => (
                                    <div key={i} className="rounded-xl border border-slate-200 p-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <Label>Title</Label>
                                                <Input
                                                    value={s.title}
                                                    onChange={(e) => {
                                                        const copy = [...steps]; copy[i] = { ...copy[i], title: e.target.value };
                                                        setEntry((p) => ({ ...p, context: { ...p.context, steps: { ...p.context.steps, steps: copy } } }));
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <Label>Description</Label>
                                                <Input
                                                    value={s.desc}
                                                    onChange={(e) => {
                                                        const copy = [...steps]; copy[i] = { ...copy[i], desc: e.target.value };
                                                        setEntry((p) => ({ ...p, context: { ...p.context, steps: { ...p.context.steps, steps: copy } } }));
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {steps.length === 0 && <div className="text-sm text-slate-500">No steps yet. Add one.</div>}
                            </div>
                        </SectionCard>

                        {/* Treatment */}
                        <SectionCard
                            title="Treatment"
                            right={
                                <button
                                    className="px-3 py-2 rounded-lg bg-slate-900 text-white text-sm hover:opacity-95"
                                    onClick={() => setEntry((p) => ({
                                        ...p,
                                        context: { ...p.context, treatment: { ...p.context.treatment, items: [...(p.context.treatment.items || []), { title: "", desc: "", icon: "" }] } }
                                    }))}
                                >
                                    + Add Item
                                </button>
                            }
                        >
                            <div className="mb-4 grid grid-cols-1 gap-4">
                                <div>
                                    <Label>Treatment Heading</Label>
                                    <Input
                                        value={entry.context.treatment.heading}
                                        onChange={(e) => setEntry((p) => ({ ...p, context: { ...p.context, treatment: { ...p.context.treatment, heading: e.target.value } } }))}
                                    />
                                </div>
                                <div>
                                    <Label>Intro</Label>
                                    <TextArea
                                        rows={3}
                                        value={entry.context.treatment.intro}
                                        onChange={(e) => setEntry((p) => ({ ...p, context: { ...p.context, treatment: { ...p.context.treatment, intro: e.target.value } } }))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                {treatItems.map((it, i) => (
                                    <div key={i} className="rounded-xl border border-slate-200 p-3">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <div>
                                                <Label>Title</Label>
                                                <Input
                                                    value={it.title}
                                                    onChange={(e) => {
                                                        const copy = [...treatItems]; copy[i] = { ...copy[i], title: e.target.value };
                                                        setEntry((p) => ({ ...p, context: { ...p.context, treatment: { ...p.context.treatment, items: copy } } }));
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <Label>Description</Label>
                                                <Input
                                                    value={it.desc}
                                                    onChange={(e) => {
                                                        const copy = [...treatItems]; copy[i] = { ...copy[i], desc: e.target.value };
                                                        setEntry((p) => ({ ...p, context: { ...p.context, treatment: { ...p.context.treatment, items: copy } } }));
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <Label>Icon</Label>
                                                <div className="mt-2">
                                                    <UploadMediaLite
                                                        file={it.icon}
                                                        onUploadComplete={(url) => {
                                                            const copy = [...treatItems]; copy[i] = { ...copy[i], icon: url };
                                                            setEntry((p) => ({ ...p, context: { ...p.context, treatment: { ...p.context.treatment, items: copy } } }));
                                                        }}
                                                        onDelete={() => {
                                                            const copy = [...treatItems]; copy[i] = { ...copy[i], icon: "" };
                                                            setEntry((p) => ({ ...p, context: { ...p.context, treatment: { ...p.context.treatment, items: copy } } }));
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {treatItems.length === 0 && <div className="text-sm text-slate-500">No treatment items yet. Add one.</div>}
                            </div>
                        </SectionCard>

                        {/* Sections */}
                        <SectionCard
                            title="Sections"
                            right={
                                <button
                                    className="px-3 py-2 rounded-lg bg-slate-900 text-white text-sm hover:opacity-95"
                                    onClick={() =>
                                        setEntry((p) => ({
                                            ...p,
                                            context: {
                                                ...p.context,
                                                sections: [
                                                    ...(p.context.sections || []),
                                                    { id: (p.context.sections?.at(-1)?.id || 0) + 1, heading: "New section", bgcolour: "fffaf6", point: ["..."] }
                                                ]
                                            }
                                        }))
                                    }
                                >
                                    + Add Section
                                </button>
                            }
                        >
                            <div className="space-y-4">
                                {sections.map((sec, i) => (
                                    <div key={i} className="rounded-xl border border-slate-200 p-3 space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <div>
                                                <Label>ID</Label>
                                                <Input
                                                    type="number"
                                                    value={sec.id}
                                                    onChange={(e) => {
                                                        const copy = [...sections]; copy[i] = { ...copy[i], id: Number(e.target.value) || 0 };
                                                        setEntry((p) => ({ ...p, context: { ...p.context, sections: copy } }));
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <Label>Heading</Label>
                                                <Input
                                                    value={sec.heading}
                                                    onChange={(e) => {
                                                        const copy = [...sections]; copy[i] = { ...copy[i], heading: e.target.value };
                                                        setEntry((p) => ({ ...p, context: { ...p.context, sections: copy } }));
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <Label>BG colour (hex w/o #)</Label>
                                                <Input
                                                    value={sec.bgcolour}
                                                    onChange={(e) => {
                                                        const copy = [...sections]; copy[i] = { ...copy[i], bgcolour: e.target.value };
                                                        setEntry((p) => ({ ...p, context: { ...p.context, sections: copy } }));
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label>Points (one per line)</Label>
                                            <TextArea
                                                rows={3}
                                                value={(sec.point || []).join("\n")}
                                                onChange={(e) => {
                                                    const arr = e.target.value.split("\n").map((s) => s.trim()).filter(Boolean);
                                                    const copy = [...sections]; copy[i] = { ...copy[i], point: arr };
                                                    setEntry((p) => ({ ...p, context: { ...p.context, sections: copy } }));
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                                {sections.length === 0 && <div className="text-sm text-slate-500">No sections yet. Add one.</div>}
                            </div>
                        </SectionCard>

                        {/* Save button footer (mobile friendly duplicate) */}
                        <div className="lg:hidden sticky bottom-4">
                            <div className="bg-white/90 backdrop-blur rounded-xl border shadow flex justify-end p-3">
                                <button
                                    onClick={save}
                                    disabled={saving}
                                    className="inline-flex items-center justify-center rounded-lg bg-slate-900 text-white px-4 py-2 text-sm hover:opacity-95 disabled:opacity-60"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div> {/* end grid */}
        </div>
    );
}
