"use client";

import ContactInfoTooltip from '@/components/ContactInfoTooltip';
import { ChevronLeft } from 'lucide-react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { Fragment, useEffect, useState } from 'react';

// ----- Local fallback (used until API loads) -----
const PAGE = {
  brand: "somi",
  backLabel: "Back",
  backUrl: "https://joinsomi.com/",
  title: "What is your primary health goal?",
  subtitle: "View Our Pricing",

  payLaterPrefix: "Buy now, pay later with",
  refundCopy:
    "We will refund 100% of your money if our licensed clinician determines you are not eligible for GLP-1 weight loss therapy.",
  guaranteeLines: ["100% Money Back", "Guarantee", "FSA and HSA Accepted"],

  badges: [
    { src: "/pricing/certified.png", alt: "Certified", w: 96, h: 96 },
    { src: "/pricing/guaranteed.png", alt: "Guaranteed", w: 112, h: 112 },
  ],

  payLogos: [
    { src: "/pay/klarna-badge.png", alt: "Klarna" },
    { src: "/pay/paypal-badge.png", alt: "PayPal" },
    { src: "/pay/affirm-badge.webp", alt: "Affirm" },
  ],

  options: [
    {
      title: "Weight Loss",
      idname: "weightloss",
      price: { note: "AS LOW AS", amount: 196, unit: "/mo" },
      href: "/pricing/weightLoss",
      image: ""
    },
    {
      title: "Longevity",
      idname: "longevity", // fixed key
      price: { note: "AS LOW AS", amount: 188, unit: "/mo" },
      href: "/pricing/longevity",
      image: ""
    },
    {
      title: "Erectile Dysfunction",
      idname: "erectiledysfunction",
      price: { note: "AS LOW AS", amount: 182, unit: "/mo" },
      href: "/pricing/erectileDysfunction",
      image: ""
    },
    {
      title: "Skin+Hair",
      idname: "skinhair",
      price: { note: "AS LOW AS", amount: 182, unit: "/mo" },
      href: "/pricing/skinhair",
      image: ""
    },
  ],
};

// ProgressBar Component
const ProgressBar = ({ progress }) => {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
      <div
        className="bg-secondary h-2.5 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

const LandingPagePricing = () => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  // NEW: DB data
  const [data, setData] = useState(null);
  const [apiError, setApiError] = useState(null);

  // fake loader bar
  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += 10;
      setProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setTimeout(() => setLoading(false), 200);
      }
    }, 80);
    return () => clearInterval(interval);
  }, []);

  // Facebook Pixel (unchanged)
  useEffect(() => {
    if (!window.fbq) {
      !(function (f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = "2.0";
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

      fbq("init", "1848512062399758");
    }
    fbq("track", "PageView");
  }, []);

  // NEW: fetch DB content
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/pricing-landing-content', { cache: 'no-store' });
        const json = await res.json();
        if (!alive) return;
        if (json?.success) {
          setData(json.result);
        } else {
          setApiError(json?.message || 'Failed to load content');
        }
      } catch (e) {
        setApiError('Failed to load content');
      }
    })();
    return () => { alive = false; };
  }, []);

  // Use DB data if available, otherwise fallback PAGE
  const D = data || PAGE;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-xl">
          <ProgressBar progress={progress} />
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        {/* For noscript support */}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1848512062399758&ev=PageView&noscript=1"
            alt="fb-pixel"
          />
        </noscript>
      </Head>

      <main>
        <div className="min-h-[100dvh] flex flex-col items-center justify-center font-SofiaSans bg-gradient-to-br from-white to-blue-50 p-4">
          <div className="w-full max-w-7xl flex flex-col items-center">
            <div className="relative w-full flex items-start justify-between mb-12">
              {/* Left: Back button */}
              <button
                className="flex text-xs items-center hover:underline text-secondary cursor-pointer mt-2"
                onClick={() => { window.location.href = D.backUrl; }}
              >
                <ChevronLeft size={18} />
                {D.backLabel}
              </button>

              {/* Center: brand logo — absolutely centered */}
              <Link href={D.backUrl}>
                <h1 className="absolute left-1/2 -translate-x-1/2 font-tagesschrift text-5xl md:text-7xl text-secondary font-bold text-center">
                  {D.brand}
                </h1>
              </Link>

              {/* Right: tooltip container */}
              <div className="mt-2">
                <ContactInfoTooltip />
              </div>
            </div>

            {/* Optional error message (non-blocking; still shows fallback) */}
            {apiError && (
              <p className="text-sm text-red-600 mb-2">{apiError}</p>
            )}

            <h2 className="text-secondary font-bold text-xl md:text-2xl mt-2 mb-1 text-center">
              {D.title}
            </h2>
            <h3 className="text-secondary text-lg font-semibold mt-2 mb-4 text-center">
              {D.subtitle}
            </h3>

            {/* ---------- Options ---------- */}
            <div className="w-full max-w-3xl mx-auto mt-2 mb-2 space-y-3">
              {(D.options || []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((opt) => (
                <Link
                  key={opt.idname || opt.title}
                  href={opt.href || '#'}
                  className={[
                    "block rounded-2xl border bg-white transition-all duration-150 ease-in-out",
                    "hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary",
                    "px-5 py-5",
                    "border-darkprimary border-l-2 hover:border-l-8 hover:bg-blue-100"
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-base md:text-lg font-medium text-gray-800">
                      {opt.title}
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] md:text-[11px] tracking-wide uppercase text-gray-500">
                        {opt?.price?.note}
                      </div>
                      <div className="text-2xl md:text-3xl text-gray-900">
                        ${opt?.price?.amount ?? 0}
                        <span className="text-lg md:text-xl font-bold text-gray-700">
                          {opt?.price?.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {/* ---------- End options ---------- */}

            <div className="flex flex-col items-center mt-4">
              <p className="text-gray-700 text-base font-bold text-center">
                {(D.guaranteeLines || []).map((line, idx) => (
                  <Fragment key={idx}>
                    {line}
                    {idx < (D.guaranteeLines || []).length - 1 && <><br /></>}
                  </Fragment>
                ))}
              </p>
            </div>

            <div className="w-full px-4 py-3 sm:px-5 sm:py-3.5 flex flex-col md:flex-row items-center justify-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[15px] text-gray-700">
                  {D.payLaterPrefix}
                </span>
              </div>

              <div className="flex items-center gap-2 py-3 sm:gap-3 ml-4">
                {(D.payLogos || []).map((logo, idx) => (
                  <Fragment key={`${logo.alt}-${idx}`}>
                    <div className="relative h-7 w-auto sm:h-8">
                      <Image
                        src={logo.src}
                        alt={logo.alt}
                        width={96}
                        height={32}
                        className="h-full w-auto rounded-md"
                        sizes="(max-width:768px) 80px, 96px"
                      />
                    </div>
                    {idx < (D.payLogos || []).length - 1 && (
                      <span className="text-sm text-gray-600 select-none" aria-hidden="true">
                        or
                      </span>
                    )}
                  </Fragment>
                ))}
              </div>
            </div>

            <p className="text-gray-700 mb-2 font-medium text-center">
              {D.refundCopy}
            </p>

            <div className="flex items-center justify-center gap-4">
              <a
                href="https://www.legitscript.com/websites/?checker_keywords=joinsomi.com"
                target="_blank"
                rel="noopener noreferrer"
                title="Verify LegitScript Approval for www.joinsomi.com"
              >
                <Image
                  src="https://static.legitscript.com/seals/44684757.png"
                  alt="Verify Approval for www.joinsomi.com"
                  width={73}
                  height={79}
                />
              </a>
              {(D.badges || []).map((b, i) => (
                <div key={`${b.alt}-${i}`} className="relative mb-2" style={{ width: b.w || 96, height: b.h || 96 }}>
                  <Image
                    src={b.src}
                    alt={b.alt}
                    fill
                    className="rounded-xl object-contain"
                    priority
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default LandingPagePricing;