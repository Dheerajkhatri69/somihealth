"use client";

import * as React from "react";
import * as Lucide from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { GripVertical, Plus, Save, Trash2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

/* ---------------------------- Popular Icons ---------------------------- */
const POPULAR_ICONS = [
    "Stethoscope",
    "Globe",
    "Package",
    "Tag",
    "Truck",
    "ShieldCheck",
    "Clock3",
    "HeartPulse",
    "CreditCard",
    "CheckCircle2",
];

function IconOption({ name, selected, onSelect }) {
    const Ico = Lucide[name] || Lucide.Circle;
    return (
        <button
            type="button"
            onClick={() => onSelect(name)}
            className={cn(
                "flex items-center gap-2 px-2 py-1 rounded-md border text-xs",
                selected ? "border-black" : "border-transparent hover:border-slate-300"
            )}
            title={String(name)}
        >
            <Ico className="h-4 w-4" />
            <span>{String(name)}</span>
        </button>
    );
}

const FIXED_KEY = "global";

/* --------------------------------- Page -------------------------------- */
export default function FeatureBannersAdmin() {
    const [rows, setRows] = React.useState([]);
    const [loading, setLoading] = React.useState(false);

    // dialog state
    const [open, setOpen] = React.useState(false);
    const [draft, setDraft] = React.useState(null); // { _id?, label, icon, active, order }
    const isNew = !draft?._id || String(draft?._id).startsWith("tmp-");

    const fetchRows = React.useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/feature-banners?key=${encodeURIComponent(FIXED_KEY)}`, { cache: "no-store" });
            const json = await res.json();
            const list = (json?.result || []).map((x, i) => ({ ...x, _id: x._id || `tmp-${i}` }));
            setRows(list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchRows();
    }, [fetchRows]);

    const onAdd = () => {
        setDraft({
            _id: `tmp-${Date.now()}`,
            key: FIXED_KEY,
            label: "New feature",
            icon: "CheckCircle2",
            order: rows.length,
            active: true,
        });
        setOpen(true);
    };

    const onEdit = (row) => {
        setDraft({ ...row });
        setOpen(true);
    };

    const onDelete = async (row) => {
        if (String(row._id).startsWith("tmp-")) {
            setRows((r) => r.filter((x) => x._id !== row._id));
            return;
        }
        const res = await fetch(`/api/feature-banners/${row._id}`, { method: "DELETE" });
        if (res.ok) await fetchRows();
    };

    const saveDraft = async () => {
        const payload = {
            key: FIXED_KEY,
            label: String(draft.label || "").trim(),
            icon: draft.icon || "CheckCircle2",
            order: Number(draft.order ?? 0),
            active: !!draft.active,
        };

        if (!payload.label) return; // quick guard

        if (isNew) {
            const res = await fetch("/api/feature-banners", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                setOpen(false);
                await fetchRows();
            }
        } else {
            const res = await fetch(`/api/feature-banners/${draft._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                setOpen(false);
                await fetchRows();
            }
        }
    };

    const saveOrder = async () => {
        const orders = rows
            .map((r) => ({ _id: r._id, order: Number(r.order ?? 0) }))
            .filter((r) => !String(r._id).startsWith("tmp-"));

        if (!orders.length) return;

        await fetch("/api/feature-banners", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: FIXED_KEY, orders }),
        });
        await fetchRows();
    };

    const isValidIcon = (name) => Boolean(Lucide[name]);

    return (
        <div className="px-4 pb-4 w-full mx-auto">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-semibold">Feature Banner</h1>
                <div className="flex items-center gap-2">
                    <Button onClick={onAdd} className="bg-secondary hover:bg-secondary/80">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Feature
                    </Button>
                    <Button variant="outline" onClick={saveOrder}>
                        <GripVertical className="h-4 w-4 mr-1" />
                        Save Order
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border bg-white overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                        <tr className="text-left">
                            <th className="px-3 py-2 w-20">Order</th>
                            <th className="px-3 py-2 w-12">Icon</th>
                            <th className="px-3 py-2">Label</th>
                            <th className="px-3 py-2 w-24">Active</th>
                            <th className="px-3 py-2 w-36">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td className="px-3 py-4" colSpan={5}>Loading…</td>
                            </tr>
                        ) : rows.length ? (
                            rows.map((row) => {
                                const Icon = Lucide[row.icon] || Lucide.Circle;
                                return (
                                    <tr key={row._id} className="border-t">
                                        <td className="px-3 py-2 align-middle">
                                            <Input
                                                type="number"
                                                value={row.order ?? 0}
                                                onChange={(e) =>
                                                    setRows((rs) =>
                                                        rs.map((x) =>
                                                            x._id === row._id
                                                                ? { ...x, order: Number(e.target.value) }
                                                                : x
                                                        )
                                                    )
                                                }
                                                className="w-20 h-8"
                                            />
                                        </td>
                                        <td className="px-3 py-2 align-middle">
                                            <Icon className="h-5 w-5" />
                                        </td>
                                        <td className="px-3 py-2 align-middle">{row.label}</td>
                                        <td className="px-3 py-2 align-middle">
                                            <span className={row.active ? "text-emerald-600" : "text-slate-400"}>
                                                {row.active ? "Yes" : "No"}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 align-middle">
                                            <div className="flex items-center gap-2">
                                                <Button variant="outline" size="sm" onClick={() => onEdit(row)}>
                                                    <Pencil className="h-4 w-4 mr-1" />
                                                    Edit
                                                </Button>
                                                <Button variant="destructive" size="sm" onClick={() => onDelete(row)}>
                                                    <Trash2 className="h-4 w-4 mr-1" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td className="px-3 py-4" colSpan={5}>No features yet. Click “Add Feature”.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{isNew ? "Add Feature" : "Edit Feature"}</DialogTitle>
                        <DialogDescription>Configure the banner item shown on your site.</DialogDescription>
                    </DialogHeader>

                    {draft && (
                        <div className="space-y-4 pt-2">
                            <div>
                                <Label className="text-xs">Label</Label>
                                <Input
                                    value={draft.label}
                                    onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                                    placeholder="e.g., Free expedited shipping"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-xs">Icon name</Label>
                                    <Input
                                        list="popular-icons"
                                        value={draft.icon}
                                        onChange={(e) => setDraft({ ...draft, icon: e.target.value })}
                                        placeholder="e.g., Package"
                                    />
                                    <datalist id="popular-icons">
                                        {POPULAR_ICONS.map((n) => (
                                            <option value={n} key={n} />
                                        ))}
                                    </datalist>
                                    {!isValidIcon(draft.icon) && (
                                        <p className="text-xs text-red-600 mt-1">
                                            Not a valid Lucide icon. Try one from the list below.
                                        </p>
                                    )}

                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {POPULAR_ICONS.map((n) => (
                                            <IconOption
                                                key={n}
                                                name={n}
                                                selected={draft.icon === n}
                                                onSelect={(name) => setDraft({ ...draft, icon: String(name) })}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-xs">Order</Label>
                                    <Input
                                        type="number"
                                        value={draft.order ?? 0}
                                        onChange={(e) => setDraft({ ...draft, order: Number(e.target.value) })}
                                        className="w-28"
                                    />
                                    <p className="text-[11px] text-slate-500 mt-1">
                                        Lower numbers appear first.
                                    </p>

                                    <div className="mt-4 flex items-center gap-2">
                                        <Switch
                                            checked={!!draft.active}
                                            onCheckedChange={(v) => setDraft({ ...draft, active: !!v })}
                                        />
                                        <span className="text-sm">Active</span>
                                    </div>
                                </div>
                            </div>

                            {/* Live preview */}
                            <div className="mt-2 border rounded-md p-3">
                                <Label className="text-xs block mb-2">Preview</Label>
                                <div className="flex items-center gap-3 text-slate-800">
                                    {(() => {
                                        const PrevIcon = Lucide[draft?.icon] || Lucide.Circle;
                                        return <PrevIcon className="h-5 w-5" />;
                                    })()}
                                    <span className="text-sm font-medium">{draft?.label || "—"}</span>
                                </div>
                            </div>

                        </div>
                    )}

                    <DialogFooter className="mt-2">
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={saveDraft}>
                            <Save className="h-4 w-4 mr-1" />
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
