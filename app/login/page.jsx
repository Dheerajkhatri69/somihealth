// app/(auth)/login/page.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import Image from "next/image";
import LoginReview from "@/components/LoginReview";

export default function LoginPage() {
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uiLoading, setUiLoading] = useState(true);
    const [form, setForm] = useState({
        email: "",
        password: "",
        remember: true,
    });
    const [error, setError] = useState("");
    const [content, setContent] = useState(null);

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
            } finally {
                setUiLoading(false);
            }
        };

        fetchContent();
    }, []);

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            // TODO: your sign-in logic here
            // await signIn(...)
        } catch (err) {
            setError("Unable to sign in. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    const branding = content?.branding || {};
    const texts = content?.texts || {};
    const hero = content?.hero || {};
    const config = content?.config || {};

    const backHref = branding.backLinkHref || "/";
    const backLabel = branding.backLinkLabel || "Back";

    return (
        <div className="min-h-screen w-full bg-white flex items-center justify-center relative">
            {/* Back link */}
            <Link
                href={backHref}
                className="absolute left-2 top-2 flex text-xs items-center hover:underline text-secondary cursor-pointer mt-2"
            >
                <ChevronLeft size={18} />
                {backLabel}
            </Link>

            {/* Left side: form */}
            <div className="flex flex-col items-center w-full p-4 md:w-1/2">
                <div className="text-center mb-4">
                    <Link href={backHref} className="inline-block">
                        <div className="text-4xl font-extrabold font-tagesschrift tracking-tight">
                            {branding.logoText || "somi"}
                        </div>
                    </Link>
                </div>

                <Card className="w-full max-w-sm border-0 border-t-2 border-b-2 border-secondary ">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-xl text-center">
                            {texts.title || "Sign in"}
                        </CardTitle>
                        <CardDescription className="text-center">
                            {texts.description || "Use your email and password"}
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={onSubmit} className="space-y-5">
                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">{texts.emailLabel || "Email"}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    autoComplete="username"
                                    placeholder="you@company.com"
                                    value={form.email}
                                    onChange={(e) =>
                                        setForm({ ...form, email: e.target.value })
                                    }
                                    className="focus:outline-none focus:ring-0 focus:border-gray-300"
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password">
                                    {texts.passwordLabel || "Password"}
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={show ? "text" : "password"}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        value={form.password}
                                        onChange={(e) =>
                                            setForm({ ...form, password: e.target.value })
                                        }
                                        className="pr-10 focus:outline-none focus:ring-0 focus:border-gray-300"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShow((s) => !s)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        aria-label={show ? "Hide password" : "Show password"}
                                    >
                                        {show ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>

                                <div className="flex items-center justify-between pt-1">
                                    {config.showRememberMe !== false && (
                                        <label
                                            htmlFor="remember"
                                            className="flex items-center gap-2"
                                        >
                                            <Checkbox
                                                id="remember"
                                                checked={form.remember}
                                                onCheckedChange={(v) =>
                                                    setForm({ ...form, remember: !!v })
                                                }
                                            />
                                            <span className="text-sm text-gray-700">
                                                {texts.rememberLabel || "Remember me"}
                                            </span>
                                        </label>
                                    )}

                                    {config.showForgotPassword !== false && (
                                        <Link
                                            href={texts.forgotPasswordHref || "/forgot-password"}
                                            className="text-sm text-primary hover:underline"
                                        >
                                            {texts.forgotPasswordText || "Forgot password?"}
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {error ? (
                                <p className="text-sm text-red-500" aria-live="polite">
                                    {error}
                                </p>
                            ) : null}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-lg bg-secondary text-white hover:bg-secondary/90 disabled:opacity-70"
                            >
                                {loading
                                    ? "Signing in…"
                                    : texts.submitLabel || "Sign in"}
                            </Button>

                            {config.showFooterLink !== false && (
                                <p className="text-center text-sm text-gray-600">
                                    {texts.footerText || "Don’t have an account?"}{" "}
                                    <Link
                                        href={texts.footerLinkHref || "/register"}
                                        className="text-primary hover:underline"
                                    >
                                        {texts.footerLinkText || "Create one"}
                                    </Link>
                                </p>
                            )}
                        </form>
                    </CardContent>
                </Card>
            </div>

            {hero.showRightPanel !== false && (
                <div className="hidden md:flex flex-col w-1/2 h-screen bg-[#f5f7f9] overflow-hidden">

                    {/* Top 70% - Service Grid */}
                    <div className="h-[70vh] w-full p-4">
                        <div className="grid grid-cols-2 gap-4 h-full w-full">
                            {[
                                { title: 'Weight Loss', image: 'https://res.cloudinary.com/dvmbfolrm/image/upload/v1764288147/fileUploader/m8wiorldootbj1do2fd0.jpg' },
                                { title: 'Longevity', image: 'https://res.cloudinary.com/dvmbfolrm/image/upload/v1764026233/fileUploader/pz4fiesttenycwmwzvwv.jpg' },
                                { title: 'Erectile Dysfunction', image: 'https://res.cloudinary.com/dvmbfolrm/image/upload/v1764026405/fileUploader/b2cblfpp9vb4qwp3ac9g.jpg' },
                                { title: 'Skin & Hair', image: 'https://res.cloudinary.com/dvmbfolrm/image/upload/v1764026867/fileUploader/w1jmxvaiwra357qqag1k.jpg' }
                            ].map((item) => (
                                <div key={item.title} className="group relative w-full h-full rounded-2xl overflow-hidden bg-slate-200">
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                                    <div className="absolute bottom-3 left-3 right-3">
                                        <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg inline-block">
                                            <p className="text-xs font-bold text-slate-900">{item.title}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom 30% - Review Component */}
                    <div className="h-[30vh] w-full flex items-center justify-center p-8 bg-white/50 backdrop-blur-xl">
                        <div className="w-full">
                            <LoginReview />
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
