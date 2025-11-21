"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

export default function FooterAdminHome() {
    const [pages, setPages] = useState([]);   // FIX #1
    const [loading, setLoading] = useState(true);

    const loadPages = async () => {
        try {
            const res = await fetch("/api/footer/all");
            const data = await res.json();
            if (data.success) setPages(data.result);
        } catch (err) {
            console.error("Error loading footer pages:", err);
        } finally {
            setLoading(false);   // FIX #2
        }
    };

    useEffect(() => {
        loadPages();
    }, []);

    if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

    return (
        <div className="w-full mx-auto max-w-7xl p-4 space-y-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl">Footer CMS</h1>

                <Link href="/dashboard/footer/create">
                    <Button className="bg-secondary hover:bg-secondary/80">Create New Page</Button>
                </Link>
            </div>

            <Separator className="my-4" />

            <div className="flex flex-wrap gap-6">

                {pages.length === 0 && (
                    <p className="text-gray-500">No footer pages found.</p>
                )}

                {pages.map((page) => (
                    <Card key={page._id} className="min-w-[200px]">
                        <CardHeader>
                            <CardTitle className="capitalize">{page.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Link href={`/dashboard/footer/${page.name}`}>
                                <Button className="w-full bg-secondary hover:bg-secondary/80">Edit Page</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ))}

            </div>
        </div>
    );
}
