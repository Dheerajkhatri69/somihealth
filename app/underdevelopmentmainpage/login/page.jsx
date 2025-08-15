// app/(auth)/login/page.jsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, Eye, EyeOff } from "lucide-react"

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
    const [show, setShow] = useState(false)
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({ email: "", password: "", remember: true })
    const [error, setError] = useState("")

    const onSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        try {
            // TODO: your sign-in logic here
            // await signIn(...)
        } catch (err) {
            setError("Unable to sign in. Please check your credentials.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full bg-white flex items-center justify-center relative">
               <Link
                    href="/underdevelopmentmainpage"
                    className='absolute left-2 top-2 flex text-xs items-center hover:underline text-secondary cursor-pointer mt-2' >
                    <ChevronLeft size={18} />Back</Link>
            <div className="flex flex-col items-center w-full p-4">
                <div className="text-center mb-4">
                    <Link href="/underdevelopmentmainpage" className="inline-block">
                        <div className="text-4xl font-extrabold font-tagesschrift tracking-tight">somi</div>
                    </Link>
                </div>
                <Card className="w-full max-w-sm border-0 border-t-2 border-b-2 border-secondary ">

                    <CardHeader className="space-y-1">
                        <CardTitle className="text-xl text-center">Sign in</CardTitle>
                        <CardDescription className="text-center">
                            Use your email and password
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={onSubmit} className="space-y-5">
                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    autoComplete="username"
                                    placeholder="you@company.com"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="focus:outline-none focus:ring-0 focus:border-gray-300"
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={show ? "text" : "password"}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        className="pr-10 focus:outline-none focus:ring-0 focus:border-gray-300"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShow((s) => !s)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        aria-label={show ? "Hide password" : "Show password"}
                                    >
                                        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>

                                <div className="flex items-center justify-between pt-1">
                                    <label htmlFor="remember" className="flex items-center gap-2">
                                        <Checkbox
                                            id="remember"
                                            checked={form.remember}
                                            onCheckedChange={(v) => setForm({ ...form, remember: !!v })}
                                        />
                                        <span className="text-sm text-gray-700">Remember me</span>
                                    </label>

                                    <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                                        Forgot password?
                                    </Link>
                                </div>
                            </div>

                            {error ? (
                                <p className="text-sm text-red-500" aria-live="polite">{error}</p>
                            ) : null}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-lg bg-secondary text-white hover:bg-secondary/90 disabled:opacity-70"
                            >
                                {loading ? "Signing in…" : "Sign in"}
                            </Button>

                            <p className="text-center text-sm text-gray-600">
                                Don’t have an account?{" "}
                                <Link href="/register" className="text-primary hover:underline">
                                    Create one
                                </Link>
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
            <div className="w-full hidden md:block bg-lightprimary-foreground">
                <div className="flex  h-screen items-center justify-center">
                    <Card className="w-full max-w-xl m-2 border-0 shadow-none rounded-3xl">
                        <img
                            src="/hero/compounded-glp1.png"
                            alt="Somi — patient care"
                            className="h-full w-full object-cover rounded-3xl"
                        />
                    </Card>
                </div>
            </div>
        </div>
    )
}
