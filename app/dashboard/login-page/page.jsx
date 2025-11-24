// app/(admin)/admin/login-page/page.jsx
"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";

// ⬇️ adjust the path if your UploadMediaLite lives somewhere else
import UploadMediaLite from "@/components/UploadMediaLite";

export default function LoginPageSettings() {
    const [content, setContent] = useState(null);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState("");

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await fetch("/api/login-page-content");
                const data = await res.json();
                if (data.success) {
                    setContent(data.result);
                }
            } catch (err) {
                console.error("Error fetching login page content:", err);
            }
        };
        fetchContent();
    }, []);

    const updateNested = (path, value) => {
        setContent((prev) => {
            if (!prev) return prev;
            const copy = structuredClone(prev);
            const keys = path.split(".");
            let obj = copy;
            for (let i = 0; i < keys.length - 1; i++) {
                const k = keys[i];
                if (!obj[k]) obj[k] = {};
                obj = obj[k];
            }
            obj[keys[keys.length - 1]] = value;
            return copy;
        });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!content) return;
        setSaving(true);
        setStatus("");

        try {
            const payload = {
                branding: content.branding,
                hero: content.hero,
                texts: content.texts,
                config: content.config,
            };

            const res = await fetch("/api/login-page-content", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (data.success) {
                setStatus("Saved successfully ✅");
            } else {
                setStatus(data.message || "Failed to save");
            }
        } catch (err) {
            console.error("Error saving login page content:", err);
            setStatus("Error saving data");
        } finally {
            setSaving(false);
            setTimeout(() => setStatus(""), 3000);
        }
    };

    if (!content) {
        return <div className="p-6">Loading login page settings…</div>;
    }

    const { branding = {}, hero = {}, texts = {}, config = {} } = content;

    return (
        <div className="p-6 w-full mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Login Page UI Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-8">
                        {/* Branding */}
                        <section className="space-y-4">
                            <h3 className="font-semibold text-lg">Branding</h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Logo text</Label>
                                    <Input
                                        value={branding.logoText || ""}
                                        onChange={(e) =>
                                            updateNested("branding.logoText", e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Back link URL</Label>
                                    <Input
                                        value={branding.backLinkHref || ""}
                                        onChange={(e) =>
                                            updateNested("branding.backLinkHref", e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Back link label</Label>
                                    <Input
                                        value={branding.backLinkLabel || ""}
                                        onChange={(e) =>
                                            updateNested("branding.backLinkLabel", e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Texts */}
                        <section className="space-y-4">
                            <h3 className="font-semibold text-lg">Texts</h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input
                                        value={texts.title || ""}
                                        onChange={(e) =>
                                            updateNested("texts.title", e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Input
                                        value={texts.description || ""}
                                        onChange={(e) =>
                                            updateNested("texts.description", e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email label</Label>
                                    <Input
                                        value={texts.emailLabel || ""}
                                        onChange={(e) =>
                                            updateNested("texts.emailLabel", e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Password label</Label>
                                    <Input
                                        value={texts.passwordLabel || ""}
                                        onChange={(e) =>
                                            updateNested("texts.passwordLabel", e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Remember me label</Label>
                                    <Input
                                        value={texts.rememberLabel || ""}
                                        onChange={(e) =>
                                            updateNested("texts.rememberLabel", e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Forgot password text</Label>
                                    <Input
                                        value={texts.forgotPasswordText || ""}
                                        onChange={(e) =>
                                            updateNested("texts.forgotPasswordText", e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Forgot password URL</Label>
                                    <Input
                                        value={texts.forgotPasswordHref || ""}
                                        onChange={(e) =>
                                            updateNested("texts.forgotPasswordHref", e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Submit button text</Label>
                                    <Input
                                        value={texts.submitLabel || ""}
                                        onChange={(e) =>
                                            updateNested("texts.submitLabel", e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Footer text</Label>
                                    <Input
                                        value={texts.footerText || ""}
                                        onChange={(e) =>
                                            updateNested("texts.footerText", e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Footer link text</Label>
                                    <Input
                                        value={texts.footerLinkText || ""}
                                        onChange={(e) =>
                                            updateNested("texts.footerLinkText", e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Footer link URL</Label>
                                    <Input
                                        value={texts.footerLinkHref || ""}
                                        onChange={(e) =>
                                            updateNested("texts.footerLinkHref", e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Right panel */}
                        <section className="space-y-4">
                            <h3 className="font-semibold text-lg">Right Panel (image)</h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex items-center space-x-2 md:col-span-2">
                                    <Checkbox
                                        id="showRightPanel"
                                        checked={hero.showRightPanel ?? true}
                                        onCheckedChange={(v) =>
                                            updateNested("hero.showRightPanel", !!v)
                                        }
                                    />
                                    <Label htmlFor="showRightPanel">
                                        Show right image panel on desktop
                                    </Label>
                                </div>

                                {/* ⬇️ Image Upload using UploadMediaLite */}
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Image</Label>
                                    <UploadMediaLite
                                        file={hero.imageSrc || ""}
                                        onUploadComplete={(url) =>
                                            updateNested("hero.imageSrc", url)
                                        }
                                        onDelete={() =>
                                            updateNested("hero.imageSrc", "")
                                        }
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label>Image alt text</Label>
                                    <Input
                                        value={hero.imageAlt || ""}
                                        onChange={(e) =>
                                            updateNested("hero.imageAlt", e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Config toggles */}
                        <section className="space-y-4">
                            <h3 className="font-semibold text-lg">Toggles</h3>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="showRememberMe"
                                        checked={config.showRememberMe ?? true}
                                        onCheckedChange={(v) =>
                                            updateNested("config.showRememberMe", !!v)
                                        }
                                    />
                                    <Label htmlFor="showRememberMe">
                                        Show Remember me
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="showForgotPassword"
                                        checked={config.showForgotPassword ?? true}
                                        onCheckedChange={(v) =>
                                            updateNested("config.showForgotPassword", !!v)
                                        }
                                    />
                                    <Label htmlFor="showForgotPassword">
                                        Show Forgot password link
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="showFooterLink"
                                        checked={config.showFooterLink ?? true}
                                        onCheckedChange={(v) =>
                                            updateNested("config.showFooterLink", !!v)
                                        }
                                    />
                                    <Label htmlFor="showFooterLink">
                                        Show Don’t have an account footer
                                    </Label>
                                </div>
                            </div>
                        </section>

                        <div className="flex items-center gap-4">
                            <Button type="submit" disabled={saving}>
                                {saving ? "Saving..." : "Save changes"}
                            </Button>
                            {status && (
                                <span className="text-sm text-muted-foreground">{status}</span>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
