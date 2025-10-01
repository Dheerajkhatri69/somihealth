'use client';
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Info } from "lucide-react";
import ContactInfoTooltip from "@/components/ContactInfoTooltip";

const INITIAL_SUMMARY = {
  product: "",
  reviewFee: 25,
  price: "",
  quantity: 1,
  label: "",
  link: "",
};

export default function PricingProductPage({ params }) {
  const key = params.name?.toLowerCase(); // "semaglutide"
  const [product, setProduct] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const summaryRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const j = await fetch(`/api/pricing/${encodeURIComponent(key)}`, { cache: "no-store" }).then(r => r.json());
        if (j?.success) setProduct(j.result);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [key]);

  const summary = selected
    ? {
      product: product?.name || "",
      reviewFee: 25,
      totle: selected?.price != null ? `$${Number(selected.price) + 25}` : "",
      price: selected?.price != null ? `$${Number(selected.price)}` : "",
      quantity: 1,
      label: selected?.label || "",
      link: selected?.link || "",
    }
    : INITIAL_SUMMARY;

  const handleOptionClick = (opt) => {
    setSelected(opt);
    if (typeof window !== "undefined" && window.innerWidth < 768 && summaryRef.current) {
      setTimeout(() => summaryRef.current.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  const handleCheckout = () => {
    if (summary.link) window.open(summary.link, "_blank");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }
  if (!product) {
    return <div className="min-h-screen flex items-center justify-center text-2xl text-secondary">Product not found</div>;
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-gradient-to-br from-white to-blue-50 p-4">
      <Link href="/pricing">
        <h1 className="font-tagesschrift text-5xl md:text-7xl text-secondary font-bold mb-2 text-center">somi</h1>
      </Link>

      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8 items-start justify-center">
        {/* Product Card */}
        <div className="w-full md:w-1/2 bg-white rounded-3xl border border-gray-200 shadow-xl p-6 flex flex-col items-center mb-4 md:mb-0">
          <div className="w-full flex items-start justify-between">
            <Link href="/pricing">
              <div className="flex text-xs items-center hover:underline text-secondary cursor-pointer">
                <ChevronLeft size={18} />Back
              </div>
            </Link>
            <ContactInfoTooltip />
          </div>

          <div className="relative w-36 h-36 md:w-[180px] md:h-[180px] mb-4">
            <Image src={product.image || "/pricing/placeholder.png"} alt={product.name} fill className="object-contain rounded-xl" priority />
          </div>
          <h2 className="text-secondary text-xl font-bold mb-4">Compounded {product.name}</h2>

          <ul className="w-full space-y-2">
            {(product.options || [])
              .slice()
              .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
              .map((opt, idx) => (
                <li
                  key={idx}
                  className={`flex flex-col md:flex-row md:items-center md:justify-between border rounded-lg px-4 py-2 transition-all duration-200 cursor-pointer
                    ${selected === opt ? "bg-blue-100 border-secondary shadow" : "bg-blue-50 border-blue-200 hover:bg-blue-100"}
                  `}
                  onClick={() => handleOptionClick(opt)}
                >
                  <span className="text-secondary font-medium text-sm md:text-base">{opt.label}</span>
                  <span className="text-secondary font-bold text-base mt-1 md:mt-0">${Number(opt.price).toFixed(0)}</span>
                </li>
              ))}
          </ul>
        </div>

        {/* Summary Card */}
        <div
          ref={summaryRef}
          className="w-full md:w-1/2 bg-white rounded-3xl border border-gray-200 shadow-xl p-6 flex flex-col justify-between min-w-[280px] max-w-md mx-auto"
        >
          <h3 className="text-secondary text-lg font-bold mb-4">Order Summary</h3>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-700 font-medium">
              <span>Product Name</span>
              <span className="font-bold text-secondary">{summary.product || "--"}</span>
            </div>
            <div className="flex justify-between text-gray-700 font-medium">
              <span>Selected Option</span>
              <span className="font-bold text-right text-secondary">{summary.label || "--"}</span>
            </div>
            <div className="flex justify-between text-gray-700 font-medium">
              <span>Quantity</span>
              <span className="font-bold text-secondary">{summary.quantity}</span>
            </div>
            <div className="flex justify-between text-gray-700 font-medium">
              <span>Subtotal</span>
              <span className="font-bold text-secondary">{summary.price || "--"}</span>
            </div>
            <div className="flex justify-between text-gray-700 font-medium">
              <span className="flex gap-2 items-center">
                Clinician Review Fee
                <div className="relative inline-flex group">
                  <Info size={20} className="cursor-pointer" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 hidden group-hover:block w-72 p-3 mb-2 text-sm bg-white rounded shadow-lg border">
                    Our $25 Clinician review fee is required for our licensed clinicians to review your health intake form for approval in 24 hours, and also to develop personalized plans that fit your wellness and weight loss goals.
                    <svg className="absolute text-white h-2 left-1/2 top-full -translate-x-1/2" viewBox="0 0 255 255">
                      <polygon className="fill-current" points="0,0 127.5,127.5 255,0" />
                    </svg>
                  </div>
                </div>
              </span>
              <span className="font-bold text-secondary">${summary.reviewFee}</span>
            </div>
            <div className="flex justify-between text-gray-700 font-medium">
              <span>Total Amount</span>
              <span className="font-bold text-secondary">{summary.totle || "--"}</span>
            </div>

            <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-lg p-4 max-w-md">
              <div className="flex items-center justify-center">
                <div className="w-8 h-8 flex items-center justify-center">
                  <Image
                    src="/pricing/like.png"
                    alt="Guaranteed"
                    width={32}
                    height={32}
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
              <div className="text-sm text-gray-700">
                <strong className="font-semibold">You&apos;re covered:</strong> We will refund 100% of your money if our licensed clinician determines you are not eligible for GLP-1 weight loss therapy. 100% money back guarantee
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-4 items-center justify-center mt-2">
            {[1, 2, 3, 6, 7, 8].map((num) => (
              <img
                key={num}
                src={`/pricing/${num}.png`}
                alt={`Payment method ${num}`}
                className="h-8 md:h-10 object-contain"
                loading="lazy"
              />
            ))}
          </div>
          <div className='flex justify-center gap-2 items-center'>
            <div className='mt-2 font-bold text-gray-600'>Financing Available</div>
            <div className="flex flex-wrap gap-2 md:gap-4 items-center justify-center mt-2">
              {[9, 10, 11].map((num) => (
                <img
                  key={num}
                  src={`/pricing/${num}.png`}
                  alt={`Payment method ${num}`}
                  className="h-6 md:h-8 object-contain"
                  loading="lazy"
                />
              ))}
            </div>
          </div>

          <div className="px-4 text-sm text-secondary font-bold text-center mt-4">
            FSA and HSA Accepted
          </div>
          <button
            className={`w-full mt-6 rounded-3xl py-4 font-bold text-base shadow transition ${summary.link ? "bg-[#0031e3] text-white hover:bg-[#0031e3]" : "bg-gray-300 text-gray-400 cursor-not-allowed"
              }`}
            onClick={handleCheckout}
            disabled={!summary.link}
          >
            Checkout {summary.totle ? summary.totle : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
