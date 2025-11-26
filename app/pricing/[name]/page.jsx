'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import ContactInfoTooltip from '@/components/ContactInfoTooltip';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const INITIAL_SUMMARY = {
  product: '',
  reviewFee: 0,
  price: '',
  quantity: 1,
  label: '',
  link: '',
  paypal: '',
};

export default function Page({ params }) {
  const routeId = (params?.name || '').toLowerCase(); // idname from URL
  const summaryRef = useRef(null);
  const router = useRouter();
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);
  const [fetchState, setFetchState] = useState('idle'); // 'idle' | 'loading' | 'ready' | 'notfound' | 'error'
  const [meta, setMeta] = useState(null);

  // track mobile viewport so we can change behavior
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(typeof window !== 'undefined' && window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const scrollToSummary = useCallback(() => {
    if (summaryRef.current) {
      summaryRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, []);


  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setFetchState('loading');
        setError(null);
        setSelected(null);
        setOptions([]);
        setMeta(null);

        const cRes = await fetch('/api/plan-categories', { cache: 'no-store' });
        const cJson = await cRes.json();
        const categories = Array.isArray(cJson?.result) ? cJson.result : [];
        const found = categories.find((c) => c.idname === routeId);
        if (!alive) return;

        if (!found) {
          setFetchState('notfound');
          return;
        }
        setMeta(found);

        const res = await fetch(`/api/plan-pay-options?name=${encodeURIComponent(routeId)}`, { cache: 'no-store' });
        const j = await res.json();
        if (!j.success) throw new Error(j.message || 'Failed to load options');

        const rows = Array.isArray(j?.result) ? j.result : [];
        rows.sort(
          (a, b) =>
            (a.sort ?? 0) - (b.sort ?? 0) ||
            (a.createdAt || '').localeCompare(b.createdAt || '')
        );

        if (!alive) return;
        setOptions(rows);
        setFetchState('ready');
      } catch (e) {
        if (!alive) return;
        setError(e?.message || 'Failed to load');
        setFetchState('error');
      }
    })();
    return () => { alive = false; };
  }, [routeId]);

  if (fetchState === 'notfound') {
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl text-secondary">
        Product not found
      </div>
    );
  }

  const isGLP1 = ['semaglutide', 'tirzepatide', 'lipotropic-mic-b12'].includes(meta?.idname);

  const summary = selected
    ? {
      product: meta?.title || '',
      reviewFee: 0,
      totle:
        selected.price && String(selected.price).trim().startsWith('$')
          ? `$${(Number(String(selected.price).replace(/[^0-9.]/g, '')) || 0)}`
          : '',
      price: selected.price || '',
      quantity: 1,
      label: selected.label || '',
      link: selected.link || '',
      paypal: selected.paypal || '',
    }
    : INITIAL_SUMMARY;

  const handleOptionClick = (opt) => {
    setSelected((prev) => (prev?._id === opt._id ? prev : opt));

    // Only scroll to summary on mobile
    if (isMobile) {
      setTimeout(() => scrollToSummary(), 100);
    }
  };


  const handleCheckout = () => { if (summary.link) window.open(summary.link, '_blank'); };
  const handlePayPalCheckout = () => { if (summary.paypal) window.open(summary.paypal, '_blank'); };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-gradient-to-br from-white to-blue-50 p-4">
      <Link href="/pricing">
        <h1 className="font-tagesschrift text-5xl md:text-7xl text-secondary font-bold mb-2 text-center">
          somi
        </h1>
      </Link>

      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8 items-start justify-center">
        {/* LEFT: Product Card */}
        <div className="w-full md:w-1/2 bg-white rounded-3xl border border-gray-200 shadow-xl p-6 flex flex-col items-center mb-4 md:mb-0">
          <div className="w-full flex items-start justify-between">
            <div
              onClick={() => router.back()}
              className="flex text-xs items-center hover:underline text-secondary cursor-pointer"
            >
              <ChevronLeft size={18} />
              Back
            </div>

            <ContactInfoTooltip />
          </div>

          {/* Image */}
          {isGLP1 ? (
            <div className="relative w-36 h-36 md:w-[180px] md:h-[180px] mb-4">
              <Image src={meta?.image || '/pricing/generic.jpg'} alt={meta?.title || ''} fill className="object-contain rounded-xl" priority />
            </div>
          ) : (
            <div className="relative w-full h-40 md:h-56 my-4">
              <Image src={meta?.image || '/pricing/generic.jpg'} alt={meta?.title || ''} fill className="object-cover rounded-2xl" priority />
            </div>
          )}

          <h2 className="text-secondary text-xl font-bold mb-4">
            {meta?.title || (fetchState === 'loading' ? <span className="inline-block h-5 w-40 bg-blue-100 rounded animate-pulse" /> : '')}
          </h2>

          {/* Options list */}
          <ul className="w-full space-y-2">
            {fetchState === 'loading' ? (
              Array.from({ length: 6 }).map((_, i) => (
                <li key={i} className="border rounded-lg px-4 py-2 bg-blue-50 border-blue-200">
                  <div className="h-4 w-1/2 bg-blue-100 animate-pulse rounded mb-2" />
                  <div className="h-4 w-20 bg-blue-100 animate-pulse rounded" />
                </li>
              ))
            ) : error ? (
              <li className="text-sm text-red-600 px-1">{error}</li>
            ) : options.length === 0 ? (
              <li className="text-sm text-gray-600 px-1">No options available right now.</li>
            ) : (
              options.map((opt, idx) => {
                const isSelected = selected?._id === opt._id;
                const isFirst = idx === 0;

                return (
                  <li
                    key={opt._id}
                    className={[
                      'relative border rounded-lg transition-colors duration-300 overflow-hidden',
                      isSelected ? 'bg-blue-100' : 'bg-blue-50 border-blue-200 hover:bg-blue-100',
                      isFirst ? 'rounded-t-lg' : ''
                    ].join(' ')}
                  >
                    {/* Banner behind the card */}
                    {isFirst && (
                      <div className="h-8 bg-pink-200 px-4 py-4 border-b-8 border-white flex items-center justify-start">
                        <span className="text-secondary font-semibold text-sm">
                          Recommended for New GLP-1 Patients
                        </span>
                      </div>
                    )}

                    {/* Row content */}
                    <button
                      type="button"
                      onClick={() => handleOptionClick(opt)}
                      className="w-full relative text-left px-4 py-4 "
                    >
                      <motion.div
                        whileTap={{ scale: 0.995 }}
                        transition={{ duration: 0.06 }}
                        className="flex items-start justify-between gap-3 relative z-10"
                      >
                        <div className="min-w-0 ">
                          <div className="text-secondary font-medium text-sm md:text-base truncate">{opt.label}</div>
                          {opt.weekdes && (
                            <div className="text-base text-gray-600 mt-0.5 break-words">{opt.weekdes}</div>
                          )}
                        </div>
                        <div className="text-secondary font-bold text-base shrink-0">{opt.price}</div>
                      </motion.div>
                    </button>
                  </li>

                );
              })
            )}
          </ul>

        </div>

        {/* RIGHT: Summary Card */}
        <div className="w-full md:w-1/2 bg-white rounded-3xl border border-gray-200 shadow-xl p-6 flex flex-col justify-between min-w-[280px] max-w-md mx-auto">
          <h3 className="text-secondary text-lg font-bold mb-4">Order Summary</h3>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-700 font-medium">
              <span>Product Name</span>
              <span className="font-bold text-secondary">{summary.product || '--'}</span>
            </div>
            <div className="flex justify-between text-gray-700 font-medium">
              <span>Selected Option</span>
              <span className="font-bold text-right text-secondary">{summary.label || '--'}</span>
            </div>
            <div className="flex justify-between text-gray-700 font-medium">
              <span>Quantity</span>
              <span className="font-bold text-secondary">{summary.quantity}</span>
            </div>
            <div className="flex justify-between text-gray-700 font-medium">
              <span>Subtotal</span>
              <span className="font-bold text-secondary">{summary.price || '--'}</span>
            </div>

            <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-lg p-4 max-w-md">
              <div className="flex items-center justify-center">
                <div className="w-8 h-8 flex items-center justify-center">
                  <Image src="/pricing/like.png" alt="Guaranteed" width={32} height={32} className="object-contain" priority />
                </div>
              </div>
              <div className="text-sm text-gray-700">
                <strong className="font-semibold">You&apos;re covered:</strong> If a licensed clinician determines you&apos;re not eligible for treatment, we&apos;ll refund 100% of your money.
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 md:gap-4 items-center justify-center mt-2">
            {[1, 2, 3, 6, 7, 8].map((num) => (
              <Image
                key={num}
                src={`/pricing/${num}.png`}
                alt={`Payment method ${num}`}
                width={40}         // adjust if needed
                height={40}        // adjust if needed
                className="h-8 md:h-10 w-auto object-contain"
              />
            ))}
          </div>

          <div className="flex justify-center gap-2 items-center">
            <div className="mt-2 font-bold text-gray-600">Financing Available</div>

            <div className="flex flex-wrap gap-2 md:gap-4 items-center justify-center mt-2">
              {[9, 10, 11].map((num) => (
                <Image
                  key={num}
                  src={`/pricing/${num}.png`}
                  alt={`Financing method ${num}`}
                  width={32}        // adjust sizes
                  height={32}
                  className="h-6 md:h-8 w-auto object-contain"
                />
              ))}
            </div>
          </div>

          <div className="px-4 text-sm text-secondary font-bold text-center mt-4">FSA and HSA Accepted</div>

          <button
            className={`w-full mt-6 rounded-3xl py-4 font-bold text-base shadow transition ${summary.link ? 'bg-[#0031e3] text-white hover:bg-[#0031e3] cursor-pointer' : 'bg-gray-300 text-gray-400 cursor-not-allowed'
              }`}
            onClick={handleCheckout}
            disabled={!summary.link}
          >
            Checkout {summary.totle ? summary.totle : ''}
          </button>

          <div className="text-sm text-gray-600 mt-6 p-2">
            <strong>Note:</strong> Once payment has been made, please proceed with the 5-7 mins Intake Questionnaire. Get Approval within 24 hours
          </div>

          {/* <div className="flex items-center justify-center gap-4 mt-2 text-sm text-gray-600">
            <hr className="w-full" /> or <hr className="w-full" />
          </div>

          <div className="flex justify-between text-gray-700 font-medium">
            <span>Total Amount for Afterpay</span>
            <span className="font-bold text-secondary">{summary.totle || '--'}</span>
          </div>

          <button
            className={`w-full mt-6 rounded-3xl py-2 font-bold text-base shadow transition border-[#b2fae4] border-2 ${summary.paypal ? 'bg-white text-black cursor-pointer' : 'bg-gray-300 text-gray-400 cursor-not-allowed'
              }`}
            onClick={handlePayPalCheckout}
            disabled={!summary.paypal}
          >
            <div className="flex items-center justify-center gap-3">
              <img src="/pricing/9.png" alt="PayPal" className="h-6 md:h-8 object-contain" loading="lazy" />
              <span>Pay via Afterpay</span>
            </div>
          </button> */}
        </div>

        <div ref={summaryRef} />
      </div>
    </div>
  );
}
