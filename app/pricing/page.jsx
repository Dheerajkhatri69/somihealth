"use client";
import ContactInfoTooltip from '@/components/ContactInfoTooltip';
import { ChevronLeft, Info } from 'lucide-react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
// import { getstartedpic } from '../../public/getstarted.png';

// ProgressBar Component
const ProgressBar = ({ progress }) => {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
      <div
        className="bg-secondary h-2.5 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};

const PRICING_OPTIONS = [
  {
    name: 'Compounded Semaglutide',
    img: '/pricing/semaglutide.png',
    href: '/pricing/semaglutide',
    alt: 'Semaglutide',
  },
  {
    name: 'Compounded Tirzepatide',
    img: '/pricing/tirzepatide.png',
    href: '/pricing/tirzepatide',
    alt: 'Tirzepatide',
  },
];

const LandingPagePricing = () => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval;
    let current = 0;
    interval = setInterval(() => {
      current += 10;
      setProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setTimeout(() => setLoading(false), 200);
      }
    }, 80);
  }, []);

  useEffect(() => {
    // Avoid multiple pixel loads
    if (!window.fbq) {
      !(function (f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod
            ? n.callMethod.apply(n, arguments)
            : n.queue.push(arguments);
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
      })(
        window,
        document,
        "script",
        "https://connect.facebook.net/en_US/fbevents.js"
      );

      fbq("init", "1848512062399758"); // Your Pixel ID
    }

    fbq("track", "PageView");
  }, []);

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

        <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-gradient-to-br from-white to-blue-50 p-4">
          <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-gray-100 px-6 flex flex-col items-center">
            <div className='w-full flex items-start justify-between'>

              <div className='flex text-xs items-center hover:underline text-secondary cursor-pointer mt-2'
                onClick={() => {
                  window.location.href = "https://joinsomi.com/";
                }}
              ><ChevronLeft size={18} />Back</div>
              <h1 className="font-tagesschrift text-5xl md:text-7xl text-secondary font-bold mb-2 text-center">somi</h1>
              <div className='mt-2'>
                <ContactInfoTooltip />
              </div>
            </div>
            <h2 className="text-secondary font-bold text-xl md:text-2xl mt-2 mb-1 text-center">Ready To Start Your Weight Loss Journey?</h2>
            <h3 className="text-secondary text-lg font-semibold mt-2 mb-4 text-center">View Our Pricing</h3>

            <div className="flex items-center justify-center gap-4 max-w-md w-full mb-6">
              {PRICING_OPTIONS.map(option => (
                <Link
                  key={option.name}
                  href={option.href}
                  className={`group flex-1 ${option.name === "Compounded Semaglutide" ? "border-l-4" : " border-r-4"} bg-blue-50 hover:bg-blue-100 border border-secondary rounded-xl p-4 flex flex-col items-center transition-all duration-200 shadow-sm hover:shadow-lg cursor-pointer`}
                >
                  <div className="relative w-20 h-20 md:w-40 md:h-40 mb-2">
                    <Image
                      src={option.img}
                      alt={option.alt}
                      fill
                      className="rounded-xl object-contain"
                      priority
                    />
                  </div>
                  <span className="text-secondary font-bold text-sm whitespace-normal md:whitespace-nowrap text-center group-hover:underline">{option.name}</span>
                  <div className="relative w-5 h-5 mt-2">
                    <Image
                      src="/pricing/check.png"
                      alt="Guaranteed"
                      fill
                      className="rounded-xl object-contain"
                      priority
                    />
                  </div>
                </Link>
              ))}
            </div>

            <div className="flex flex-col items-center mb-4">

              <p className="text-gray-700 text-base font-bold text-center">
                100% Money Back <br /> Guarantee
              </p>
            </div>

            <p className="text-gray-700 mb-2 font-medium text-center">
              We will refund 100% of your money if our licensed clinician determines you are not eligible for GLP-1 weight loss therapy.
            </p>
            <div className='flex items-center justify-center gap-4'>
              <div className="relative w-24 h-24 mb-2">
                <Image
                  src="/pricing/certified.png"
                  alt="Guaranteed"
                  fill
                  className="rounded-xl object-contain"
                  priority
                />
              </div>
              <div className="relative w-28 h-28 mb-2">
                <Image
                  src="/pricing/guaranteed.png"
                  alt="Guaranteed"
                  fill
                  className="rounded-xl object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default LandingPagePricing;
