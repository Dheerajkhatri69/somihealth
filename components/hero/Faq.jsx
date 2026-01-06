'use client';

import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';

/** Pro FAQ (single-open, smooth slide animation) */
export default function FaqPro() {
  const [faqData, setFaqData] = useState({
    _id: '',
    heading: 'Find clear, honest answers about our medical weight loss treatments',
    subheading: 'Your Questions, Answered— Every Step of the Way.',
    faqs: [],
    benefits: [],
    footerTitle: 'Still have questions?',
    footerDescription: "Can't find the answer you're looking for? Please chat to our friendly team.",
    footerButtonText: 'Get in touch',
    footerButtonLink: '/contact',
  });
  const [loading, setLoading] = useState(true);

  // Single-open accordion
  const [openIdx, setOpenIdx] = useState(null);
  const toggle = (idx) => setOpenIdx((prev) => (prev === idx ? null : idx));

  // Fetch FAQ data from API
  useEffect(() => {
    const fetchFAQData = async () => {
      try {
        const response = await fetch('/api/faq', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          setFaqData((prev) => ({ ...prev, ...data })); // merge to keep shape
        }
      } catch (error) {
        console.error('Error fetching FAQ data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFAQData();
  }, []);

  // Open the first FAQ the first time data finishes loading
  useEffect(() => {
    if (!loading && openIdx === null && Array.isArray(faqData.faqs) && faqData.faqs.length > 0) {
      setOpenIdx(0);
    }
  }, [loading, faqData.faqs, openIdx]);

  if (loading) {
    return (
      <section className="relative isolate w-full overflow-hidden py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
          </div>
        </div>
      </section>
    );
  }

  // Animated answer (max-height + translate + fade)
  function Answer({ isOpen, id, labelledBy, children }) {
    const innerRef = useRef(null);
    const [maxH, setMaxH] = useState(0);

    useLayoutEffect(() => {
      if (!innerRef.current) return;
      setMaxH(isOpen ? innerRef.current.scrollHeight : 0);
    }, [isOpen, children]);

    return (
      <div
        id={id}
        role="region"
        aria-labelledby={labelledBy}
        aria-hidden={!isOpen}
        className="overflow-hidden transition-[max-height,opacity,transform] duration-500 ease-in-out will-change-[max-height,opacity,transform]"
        style={{ maxHeight: `${maxH}px`, opacity: isOpen ? 1 : 0, transform: isOpen ? 'translateY(0)' : 'translateY(-6px)' }}
      >
        <div ref={innerRef} className="px-5 pb-5 pl-7 pr-6 text-lg font-SofiaSans leading-6 text-gray-700 sm:px-6 sm:pl-8 sm:text-xl">
          {children}
        </div>
      </div>
    );
  }

  return (
    <section className="relative isolate w-full overflow-hidden py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid items-start gap-10 md:grid-cols-3">
          {/* Left */}
          <div className="md:sticky font-SofiaSans">
            <span className="border-darkprimary border-2 inline-flex items-center gap-2 rounded-full bg-secondary/10 px-4 py-1 text-lg font-semibold text-secondary">
              <ShieldIcon className="h-5 w-5" /> FAQ
            </span>
            <h2 className="mt-3 text-2xl text-darkprimary sm:text-3xl">{faqData.heading}</h2>
            <p className="mt-2 text-sm font-semibold text-secondary sm:text-lg">{faqData.subheading}</p>

            <ul className="mt-5 space-y-2 text-base text-gray-600">
              {faqData.benefits?.map((benefit, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckIcon className="h-5 w-5 text-emerald-600" />
                  {benefit.text}
                </li>
              ))}
            </ul>
          </div>

          {/* Right */}
          <div className="md:col-span-2">
            <div className="overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-black/5">
              <div className="h-1 w-full bg-gradient-to-r from-secondary/70 via-secondary to-secondary/70" />

              <ul className="divide-y">
                {faqData.faqs?.map((item, idx) => {
                  const isOpen = openIdx === idx;
                  const panelId = `faq-panel-${idx}`;
                  const btnId = `faq-button-${idx}`;

                  return (
                    <li key={idx} className="group">
                      <button
                        id={btnId}
                        type="button"
                        aria-controls={panelId}
                        aria-expanded={isOpen}
                        onClick={() => toggle(idx)}
                        className={`flex w-full items-start gap-4 px-5 py-4 text-left transition-colors sm:px-6 ${isOpen ? 'bg-secondary/3' : 'hover:bg-gray-50'
                          }`}
                      >
                        <span className="mt-2 block h-2 w-2 flex-shrink-0 rounded-full bg-secondary/70" />
                        <span className="flex-1 pr-6 text-base font-semibold sm:text-xl font-SofiaSans">
                          {item.question}
                        </span>
                        <PlusMinusIcon open={isOpen} />
                      </button>

                      <Answer isOpen={isOpen} id={panelId} labelledBy={btnId}>
                        {item.answer}
                      </Answer>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Footer callout */}
            <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-2xl bg-white p-5 shadow-lg ring-1 ring-black/5 sm:flex-row sm:items-center sm:p-6">
              <div>
                <h3 className="text-base font-semibold text-gray-900">{faqData.footerTitle}</h3>
                <p className="mt-1 text-sm text-gray-600">{faqData.footerDescription}</p>
              </div>
              <a
                href={faqData.footerButtonLink}
                className="fx-primary inline-flex items-center gap-2 rounded-full bg-darkprimary px-5 py-2 text-sm font-semibold text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60"
              >
                {faqData.footerButtonText}
                <ArrowRight />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===== Icons ===== */
function PlusMinusIcon({ open }) {
  return (
    <span
      className={`relative mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ring-1 ring-gray-300 transition-colors ${open ? 'bg-secondary text-white ring-secondary/60' : 'bg-white text-gray-700'
        }`}
      aria-hidden="true"
    >
      <span
        className={`absolute h-3.5 w-0.5 rounded-sm transition-opacity ${open ? 'opacity-0' : 'opacity-100'}`}
        style={{ backgroundColor: 'currentColor' }}
      />
      <span className="absolute h-0.5 w-3.5 rounded-sm" style={{ backgroundColor: 'currentColor' }} />
    </span>
  );
}
function ShieldIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2l7 3v6c0 5.55-3.84 8.97-7 10-3.16-1.03-7-4.45-7-10V5l7-3z" />
      <path d="M10.5 12.5l-1.5-1.5L8 12l2.5 2.5L16 9l-1-1-4.5 4.5z" fill="white" />
    </svg>
  );
}
function CheckIcon({ className = 'h-5 w-5 text-emerald-600' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M9 16.2l-3.5-3.5-1.4 1.4L9 19 20.3 7.7 18.9 6.3z" />
    </svg>
  );
}
function ArrowRight() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
