"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

export default function FooterEditor({ params }) {
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadPage = useCallback(async () => {
        const res = await fetch(`/api/footer/${params.name}`);
        const data = await res.json();
        if (data.success) setPage(data.result);
        setLoading(false);
    }, [params.name]);


    useEffect(() => {
        loadPage();
    }, [loadPage]);

    // ---- Add new block ----
    const addBlock = (type) => {
        const newBlock =
            type === "list"
                ? { type, items: [] }
                : { type, text: "" };

        setPage({ ...page, blocks: [...page.blocks, newBlock] });
    };

    const updateBlock = (index, key, value) => {
        const updated = [...page.blocks];
        updated[index][key] = value;
        setPage({ ...page, blocks: updated });
    };

    const deleteBlock = (index) => {
        const updated = [...page.blocks];
        updated.splice(index, 1);
        setPage({ ...page, blocks: updated });
    };

    const savePage = async () => {
        const res = await fetch(`/api/footer/${params.name}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(page),
        });

        alert("Saved!");
    };

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>

    if (!page) return <p className="p-8">Page not found.</p>;

    return (
        <div className="w-full mx-auto max-w-7xl p-4 space-y-6">

            <Card>
                <CardHeader>
                    <CardTitle>Edit Footer Page — {params.name}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">

                    {/* Add block buttons */}
                    <div className="flex gap-3">
                        <Button className="bg-secondary hover:bg-secondary/80" onClick={() => addBlock("heading")}>Add Heading</Button>
                        <Button className="bg-secondary hover:bg-secondary/80" onClick={() => addBlock("subheading")}>Add Subheading</Button>
                        <Button className="bg-secondary hover:bg-secondary/80" onClick={() => addBlock("paragraph")}>Add Paragraph</Button>
                        <Button className="bg-secondary hover:bg-secondary/80" onClick={() => addBlock("list")}>Add List</Button>
                    </div>

                    <Separator />

                    {/* Render blocks */}
                    {page.blocks.map((block, index) => (
                        <Card key={index} className="p-4 space-y-4 border">

                            {/* Block type dropdown */}
                            <Select
                                value={block.type}
                                onValueChange={(v) => updateBlock(index, "type", v)}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select block type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="heading">Heading</SelectItem>
                                    <SelectItem value="subheading">Subheading</SelectItem>
                                    <SelectItem value="paragraph">Paragraph</SelectItem>
                                    <SelectItem value="list">List</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Text input */}
                            {block.type !== "list" && (
                                <Textarea
                                    rows={3}
                                    placeholder="Enter text..."
                                    value={block.text}
                                    onChange={(e) => updateBlock(index, "text", e.target.value)}
                                />
                            )}

                            {/* List items */}
                            {block.type === "list" && (
                                <div className="space-y-2">
                                    {(block.items || []).map((item, i) => (
                                        <Input
                                            key={i}
                                            value={item}
                                            onChange={(e) => {
                                                const updated = [...block.items];
                                                updated[i] = e.target.value;

                                                updateBlock(index, "items", updated);
                                            }}
                                            placeholder={`List item ${i + 1}`}
                                        />
                                    ))}

                                    <Button
                                        className="bg-secondary hover:bg-secondary/80"
                                        onClick={() =>
                                            updateBlock(index, "items", [...(block.items || []), ""])
                                        }
                                    >
                                        Add List Item
                                    </Button>
                                </div>
                            )}

                            {/* Delete button */}
                            <Button variant="destructive" onClick={() => deleteBlock(index)}>
                                Delete Block
                            </Button>

                        </Card>
                    ))}

                    {/* Save button */}
                    <Button className="w-full mt-4" onClick={savePage}>
                        Save Page
                    </Button>

                </CardContent>
            </Card>

        </div>
    );
}
