// app/not-found.jsx
"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  const brand = "somi";

  return (
    <main className="relative min-h-[80vh] grid place-items-center overflow-hidden px-4">
      {/* BG gradient + decorative blobs */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#E9ECF1] via-white to-white" />
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl opacity-50"
           style={{ background: "linear-gradient(135deg, #E9ECF1, #E5E5EE)" }} />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full blur-3xl opacity-40"
           style={{ background: "linear-gradient(135deg, #E5E5EE, #E9ECF1)" }} />

      {/* Card */}
      <div className="relative mx-auto w-full max-w-2xl rounded-2xl border border-white/50 bg-white/60 backdrop-blur-xl shadow-[0_10px_40px_rgba(16,24,40,0.08)] p-8 md:p-12">
        {/* Glow ring */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-black/5" />

        {/* Logo */}
        <div className="text-center">
          <Link
            href="/underdevelopmentmainpage"
            className="text-secondary font-bold font-SofiaSans tracking-tight md:order-none inline-block
                       text-5xl md:text-7xl leading-none"
            aria-label="Go to main page"
          >
            {brand}
          </Link>

          <p className="mt-5 text-base md:text-lg text-gray-600">
            This site is under development. We’re polishing things up.
          </p>
          <p className="mt-1 text-sm text-gray-500">
            In the meantime, head to the main page.
          </p>

          {/* Actions */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/underdevelopmentmainpage"
              className="group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold
                         text-white shadow-sm transition-transform hover:scale-[1.02] focus:scale-[1.02] focus:outline-none
                         active:scale-[0.99]"
              style={{ backgroundColor: "#0F172A" }}
            >
              Go to main page
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>

            {/* Optional subtle link back to root, remove if not needed */}
            <Link
              href="/"
              className="inline-flex items-center rounded-full px-5 py-3 text-sm font-medium
                         text-gray-700 hover:text-gray-900 bg-white/70 border border-gray-200 backdrop-blur
                         transition-colors"
            >
              Back to /
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
