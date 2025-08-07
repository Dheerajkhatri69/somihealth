"use client";

import Image from "next/image";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import Navbar from "@/components/hero/Navbar";
import SomiFooter from "@/components/hero/SomiFooter";
import ContactFormShadcn from "@/components/hero/contactForm";

export default function ContactPage() {

    return (
        <>
            <Navbar />
            <main className="relative">
                {/* Hero */}
                <section className="bg-secondary/80">
                    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 lg:py-20 relative">
                        {/* Decorative product image */}
                        <div className="pointer-events-none absolute inset-0 -z-0 opacity-20">
                            <Image
                                src="/hero/somi-vials.png"
                                alt="Somi product arrangement"
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>

                        <div className="relative z-10 grid gap-10 md:grid-cols-2">
                            {/* Left: copy image you gave */}
                            <div className="rounded-2xl bg-white/70 p-4 backdrop-blur">
                                <Image
                                    src="/hero/hero-copy.png"
                                    alt="Somi Health contact copy"
                                    width={1600}
                                    height={480}
                                    className="w-full rounded-xl ring-1 ring-black/5"
                                    priority
                                />
                            </div>

                            {/* Right: quick contact cards */}
                            <div className="flex flex-col justify-center gap-4 font-SofiaSans">
                                <h1 className="text-4xl text-white md:text-5xl">Contact Somi Health</h1>
                                <p className="text-white/90">
                                    We’re here to help at every step of your weight loss journey. Call, email, or
                                    send us a message—whatever works best for you.
                                </p>

                                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                    <a
                                        href="tel:+17043866871"
                                        className="group flex items-center gap-3 rounded-xl bg-white/80 p-4 ring-1 ring-black/5 transition hover:bg-white"
                                    >
                                        <span className="rounded-lg bg-[#E9ECF1] p-2">
                                            <Phone className="h-5 w-5 text-[#232a3a]" />
                                        </span>
                                        <div>
                                            <div className="text-xs uppercase tracking-wide text-slate-500">Phone</div>
                                            <div className="font-semibold text-slate-900">(704) 386-6871</div>
                                        </div>
                                    </a>

                                    <a
                                        href="mailto:info@joinsomi.com"
                                        className="group flex items-center gap-3 rounded-xl bg-white/80 p-4 ring-1 ring-black/5 transition hover:bg-white"
                                    >
                                        <span className="rounded-lg bg-[#E9ECF1] p-2">
                                            <Mail className="h-5 w-5 text-[#232a3a]" />
                                        </span>
                                        <div>
                                            <div className="text-xs uppercase tracking-wide text-slate-500">Email</div>
                                            <div className="font-semibold text-slate-900">info@joinsomi.com</div>
                                        </div>
                                    </a>

                                    <div className="flex items-center gap-3 rounded-xl bg-white/80 p-4 ring-1 ring-black/5">
                                        <span className="rounded-lg bg-[#E9ECF1] p-2">
                                            <MapPin className="h-5 w-5 text-[#232a3a]" />
                                        </span>
                                        <div>
                                            <div className="text-xs uppercase tracking-wide text-slate-500">Address</div>
                                            <div className="font-medium text-slate-900">United States (Remote-first)</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 rounded-xl bg-white/80 p-4 ring-1 ring-black/5">
                                        <span className="rounded-lg bg-[#E9ECF1] p-2">
                                            <Clock className="h-5 w-5 text-[#232a3a]" />
                                        </span>
                                        <div>
                                            <div className="text-xs uppercase tracking-wide text-slate-500">Hours</div>
                                            <div className="font-medium text-slate-900">Mon–Fri, 9am–6pm ET</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contact form */}
                <section className="relative -mt-10 pb-20">
                    <div className="mx-auto max-w-6xl px-4 md:px-6">
                        <div className="grid gap-10 md:grid-cols-5">
                            <div className="md:col-span-3">
                                    <ContactFormShadcn />
                            </div>

                            {/* Side: reassurance / CTA */}
                            <aside className="md:col-span-2">
                                <div className="sticky top-20 rounded-2xl bg-[#E9ECF1] p-6 ring-1 ring-black/5">
                                    <h3 className="text-lg font-semibold text-slate-900">What to expect</h3>
                                    <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
                                        <li>Replies within one business day.</li>
                                        <li>Care from licensed clinicians.</li>
                                        <li>No spam—just help when you need it.</li>
                                    </ul>

                                    <div className="mt-6 text-sm text-slate-600">
                                        Prefer to call? <a href="tel:+17043866871" className="font-medium text-slate-900 underline"> (704) 386-6871</a>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </div>
                </section>
            </main>
            <SomiFooter />
        </>
    );
}
