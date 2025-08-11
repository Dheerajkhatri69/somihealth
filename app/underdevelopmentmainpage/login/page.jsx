// app/(auth)/login/page.jsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"

export default function LoginPage() {
    const router = useRouter()
    const [show, setShow] = useState(false)
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({ email: "", password: "", remember: true })
    const [error, setError] = useState("")

    const onSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setLoading(true)
        try {
            // TODO: Replace with your API call
            await new Promise((r) => setTimeout(r, 600)) // mock
            router.push("/dashboard")
        } catch {
            setError("Invalid credentials. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className={`
        relative min-h-screen w-full overflow-hidden
        bg-lightprimary text-gray-900
      `}
        >
            {/* soft background pattern + glow */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage:
                        "radial-gradient(30rem 30rem at 10% 10%, rgba(255,255,255,0.55), transparent 60%), radial-gradient(28rem 28rem at 90% 20%, rgba(255,255,255,0.35), transparent 60%), radial-gradient(24rem 24rem at 60% 90%, rgba(255,255,255,0.25), transparent 60%)",
                }}
            />
            <div className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,transparent,rgba(0,0,0,0.02))]" />
            <div className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.06]" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 opacity=%220.8%22 width=%2240%22 height=%2240%22><rect width=%2240%22 height=%2240%22 fill=%22%23ffffff%22/><path d=%22M0 40 L40 0 M-10 10 L10 -10 M30 50 L50 30%22 stroke=%22%23d1d5db%22 stroke-width=%221%22 fill=%22none%22/></svg>')" }} />

            {/* grid layout */}
            <div className="grid min-h-screen grid-cols-1 md:grid-cols-2 font-SofiaSans">

                {/* LEFT: form area */}
                <div className="relative flex items-center justify-center p-6 sm:p-10 lg:p-14">
                    {/* brand header */}
                    <div className="absolute left-6 top-6 md:left-10 md:top-10 flex items-center gap-2">
                        <Link
                            href="/underdevelopmentmainpage"
                        >
                            <div className="text-3xl font-extrabold tracking-tight text-center font-SofiaSans">somi</div>
                        </Link>
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-0.5 text-xs font-medium text-gray-800 shadow-sm">
                            <ShieldCheck className="size-3.5" />
                            secure access
                        </span>
                    </div>

                    {/* glass card */}
                    <Card className="w-full max-w-xl border-white/60 bg-white/80 backdrop-blur-md shadow-xl">
                        <CardHeader className="pb-2">
                            <div className="mb-2 inline-flex items-center gap-2 text-primary">
                                <Sparkles className="size-4" />
                                <span className="text-xs font-semibold uppercase tracking-wide">Welcome</span>
                            </div>
                            <CardTitle className="text-3xl font-bold">Sign in to your account</CardTitle>
                            <CardDescription className="text-gray-600">
                                Use your work email to access the Somi admin.
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={onSubmit} className="space-y-6">
                                {/* Email */}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm">Email</Label>
                                    <div className="relative group">
                                        <Mail className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 size-4 text-gray-400 transition-colors group-focus-within:text-primary" />
                                        <Input
                                            id="email"
                                            type="email"
                                            autoComplete="username"
                                            placeholder="you@company.com"
                                            className="pl-10 transition-shadow focus:shadow-[0_0_0_4px_rgba(59,130,246,0.15)]"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm">Password</Label>
                                    <div className="relative group">
                                        <Lock className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 size-4 text-gray-400 transition-colors group-focus-within:text-primary" />
                                        <Input
                                            id="password"
                                            type={show ? "text" : "password"}
                                            autoComplete="current-password"
                                            placeholder="••••••••"
                                            className="pl-10 pr-10 transition-shadow focus:shadow-[0_0_0_4px_rgba(59,130,246,0.15)]"
                                            value={form.password}
                                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            onClick={() => setShow((s) => !s)}
                                            aria-label={show ? "Hide password" : "Show password"}
                                        >
                                            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                        </button>
                                    </div>
                                    {/* helper row */}
                                    <div className="flex items-center justify-between pt-1">
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                id="remember"
                                                checked={form.remember}
                                                onCheckedChange={(v) => setForm({ ...form, remember: !!v })}
                                            />
                                            <Label htmlFor="remember" className="text-sm text-gray-700">Remember me</Label>
                                        </div>
                                        <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                                            Forgot password?
                                        </Link>
                                    </div>
                                </div>

                                {error ? (
                                    <p className="text-sm text-red-500">{error}</p>
                                ) : null}

                                {/* submit */}
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-hero w-full gap-2 bg-primary text-white bg-secondary rounded-2xl hover:bg-secondary/90 transition-transform active:scale-[0.99]"
                                >
                                    {loading ? "Signing in…" : "Sign in"}
                                </Button>

                                {/* small foot */}
                                <p className="text-center text-sm text-gray-600">
                                    Don’t have an account?{" "}
                                    <Link href="/register" className="text-primary hover:underline">
                                        Create one
                                    </Link>
                                </p>
                            </form>
                        </CardContent>
                    </Card>

                    {/* glow under card */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-10 mx-auto h-24 w-[36rem] -translate-y-6 rounded-[100%] bg-primary/30 blur-3xl opacity-40 md:opacity-50" />
                </div>

                {/* RIGHT: image & badges */}
                <div className="relative hidden overflow-hidden md:block">
                    <img
                        src="/hero/compounded-glp1.png"
                        alt="Somi — patient care"
                        className="h-full w-full object-cover"
                    />
                    {/* blend overlay to match bg-lightprimary */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-lightprimary via-lightprimary/55 to-transparent" />

                    {/* floating info badges */}
                    <div className="absolute inset-x-0 top-8 flex justify-end px-8">
                        <div className="flex flex-col gap-3">
                            <div className="rounded-2xl bg-white/85 px-4 py-2 shadow-md backdrop-blur">
                                <div className="text-xs uppercase text-gray-500">Uptime</div>
                                <div className="text-sm font-semibold text-gray-900">99.98%</div>
                            </div>
                            <div className="rounded-2xl bg-white/85 px-4 py-2 shadow-md backdrop-blur">
                                <div className="text-xs uppercase text-gray-500">Data Encrypted</div>
                                <div className="text-sm font-semibold text-gray-900">At Rest & Transit</div>
                            </div>
                        </div>
                    </div>

                    {/* bottom brand strip */}
                    <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between rounded-xl bg-white/70 px-4 py-2 text-gray-800 shadow backdrop-blur">
                        <div className="flex items-center gap-3">
                            <div className="text-lg font-bold tracking-tight">somi</div>
                            <span className="h-1 w-1 rounded-full bg-gray-400" />
                            <span className="text-sm">Trusted clinical partner</span>
                        </div>
                        <span className="text-xs">© {new Date().getFullYear()} Somi Health</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
