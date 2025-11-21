"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function CreateFooterPage() {
    const [name, setName] = useState("");

    const createPage = async () => {
        if (!name) return alert("Name is required");

        const res = await fetch("/api/footer/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
        });

        const data = await res.json();

        if (data.success) {
            window.location.href = `/admin/footer/${name}`;
        } else {
            alert("Error creating page");
        }
    };

    return (
        <div className="w-full mx-auto max-w-7xl p-4 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Create Footer Page</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    <Input
                        placeholder="page-name (example: hipaa)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <Button className="w-full bg-secondary hover:bg-secondary/80" onClick={createPage}>Create Page</Button>
                </CardContent>
            </Card>
        </div>
    );
}
