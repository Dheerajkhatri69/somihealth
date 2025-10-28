"use client";
import ContactInfoTooltip from '@/components/ContactInfoTooltip';
import { ChevronLeft, Info } from 'lucide-react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const WeightLossPagePricing = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await fetch('/api/pricing-weightloss-content', {
                    cache: 'no-store',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                const json = await res.json();

                if (json.success) {
                    setData(json.result);
                } else {
                    setError('Failed to load content');
                }
            } catch (err) {
                console.error('Error fetching weight loss content:', err);
                setError('Error loading content');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-white to-blue-50 p-4">
                <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-gray-100 px-6 py-8 flex flex-col items-center">
                    <div className="animate-pulse">
                        <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
                        <div className="h-6 w-80 bg-gray-200 rounded mb-2"></div>
                        <div className="h-6 w-96 bg-gray-200 rounded mb-6"></div>
                        <div className="flex justify-center gap-4 mb-6">
                            <div className="h-40 w-40 bg-gray-200 rounded"></div>
                        </div>
                        <div className="h-16 w-80 bg-gray-200 rounded mb-4"></div>
                        <div className="h-12 w-96 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-white to-blue-50 p-4">
                <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-gray-100 px-6 py-8 flex flex-col items-center">
                    <div className="text-center text-red-600">
                        <h2 className="text-xl font-bold mb-2">Error Loading Content</h2>
                        <p>{error || 'No data available'}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-secondary text-white rounded hover:bg-blue-600"
                        >
                            Retry
                        </button>
                    </div>
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
                        {/* Header Section */}
                        <div className='w-full flex items-start justify-between'>
                            <Link href={data.backHref || "/pricing"}>
                                <div className='flex text-xs items-center hover:underline text-secondary cursor-pointer mt-2'>
                                    <ChevronLeft size={18} />
                                    {data.backLabel || "Back"}
                                </div>
                            </Link>

                            <h1 className="font-tagesschrift text-5xl md:text-7xl text-secondary font-bold mb-2 text-center">
                                {data.brand || "somi"}
                            </h1>
                            <div className='mt-2'>
                                <ContactInfoTooltip />
                            </div>
                        </div>

                        {/* Main Heading */}
                        <h2 className="text-secondary font-bold text-xl md:text-2xl mt-2 mb-1 text-center">
                            {data.heading || "Ready To Start Your Weight Loss Journey?"}
                        </h2>
                        <h3 className="text-secondary text-lg font-semibold mt-2 mb-4 text-center">
                            {data.subheading || "View Our Pricing"}
                        </h3>

                        {/* Pricing Options */}
                        <div className="flex items-center justify-center gap-4 max-w-md w-full mb-6">
                            {(data.options || []).map((option, index) => (
                                <Link
                                    key={option.title || index}
                                    href={option.href || "#"}
                                    className="group flex-1 bg-blue-50 hover:bg-blue-100 border border-secondary rounded-xl p-4 flex flex-col items-center transition-all duration-200 shadow-sm hover:shadow-lg cursor-pointer"
                                >
                                    <div className="relative w-20 h-20 md:w-40 md:h-40 mb-2">
                                        <Image
                                            src={option.image || "/placeholder-image.png"}
                                            alt={option.alt || option.title || "Pricing option"}
                                            fill
                                            className="rounded-xl object-contain"
                                            priority
                                        />
                                    </div>
                                    <span className="text-secondary font-bold text-sm whitespace-normal md:whitespace-nowrap text-center group-hover:underline">
                                        {option.title}
                                    </span>
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

                        {/* Guarantee Lines */}
                        <div className="flex flex-col items-center mb-4">
                            <p className="text-gray-700 text-base font-bold text-center">
                                {(data.guarantee?.lines || ["100% Money Back", "Guarantee", "FSA and HSA Accepted"]).map((line, index, array) => (
                                    <span key={index}>
                                        {line}
                                        {index < array.length - 1 && <br />}
                                    </span>
                                ))}
                            </p>
                        </div>

                        {/* Refund Text */}
                        <p className="text-gray-700 mb-2 font-medium text-center max-w-2xl">
                            {data.guarantee?.refundText || "We will refund 100% of your money if our licensed clinician determines you are not eligible for GLP-1 weight loss therapy."}
                        </p>

                        {/* Badges */}
                        <div className='flex items-center justify-center gap-4 mb-6'>
                            {(data.badges || []).map((badge, index) => (
                                <div
                                    key={index}
                                    className="relative mb-2"
                                    style={{
                                        width: badge.w || 96,
                                        height: badge.h || 96
                                    }}
                                >
                                    <Image
                                        src={badge.src || "/placeholder-badge.png"}
                                        alt={badge.alt || "Badge"}
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

export default WeightLossPagePricing;