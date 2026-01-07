"use client";
import ContactInfoTooltip from '@/components/ContactInfoTooltip';
import { Skeleton } from '@/components/ui/skeleton';
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

                    {/* Top Section */}
                    <div className="w-full flex items-start justify-between">
                        <Skeleton className="h-4 w-20 mt-2 rounded" />
                        <Skeleton className="h-10 w-64 md:w-80 rounded-xl" />
                        <Skeleton className="h-7 w-7 rounded-xl mt-2" />
                    </div>

                    {/* Headings */}
                    <div className="mt-8 space-y-3 w-full max-w-lg">
                        <Skeleton className="h-6 w-full rounded" />
                        <Skeleton className="h-5 w-3/4 rounded" />
                    </div>

                    {/* Pricing Options Grid */}
                    <div className="grid grid-cols-2 gap-4 sm:flex sm:items-center sm:justify-center max-w-md w-full mb-6 mt-10">
                        {Array.from({ length: 2 }).map((_, idx) => (
                            <div
                                key={idx}
                                className="border border-gray-200 rounded-xl p-4 flex flex-col items-center w-full shadow-sm"
                            >
                                <Skeleton className="w-20 h-20 md:w-40 md:h-40 rounded-xl mb-3" />
                                <Skeleton className="h-4 w-20 rounded mb-2" />
                                <Skeleton className="w-5 h-5 rounded-full" />
                            </div>
                        ))}
                    </div>

                    {/* Guarantee Lines */}
                    <div className="mt-6 space-y-2 text-center w-full max-w-xs">
                        <Skeleton className="h-4 w-32 mx-auto rounded" />
                        <Skeleton className="h-4 w-28 mx-auto rounded" />
                        <Skeleton className="h-4 w-36 mx-auto rounded" />
                    </div>

                    {/* Refund Line */}
                    <div className="mt-6 space-y-2 w-full max-w-xl text-center mx-auto">
                        <Skeleton className="h-4 w-full rounded" />
                        <Skeleton className="h-4 w-4/5 mx-auto rounded" />
                    </div>

                    {/* Badges */}
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <Skeleton className="w-24 h-24 rounded-xl" />
                        <Skeleton className="w-24 h-24 rounded-xl" />
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
                <div className="min-h-[100dvh] flex flex-col font-SofiaSans items-center justify-center bg-gradient-to-br from-white to-blue-50 p-4">
                    <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-gray-100 px-6 flex flex-col items-center">
                        {/* Header Section */}
                        <div className='w-full flex items-start justify-between'>
                            <Link href={data.backHref || "/pricing"}>
                                <div className='flex text-xs items-center hover:underline text-secondary cursor-pointer mt-2'>
                                    <ChevronLeft size={18} />
                                    {data.backLabel || "Back"}
                                </div>
                            </Link>
                            <Link href="/">
                                <h1 className="font-tagesschrift text-5xl md:text-7xl text-secondary font-bold mb-2 text-center">
                                    {data.brand || "somi"}
                                </h1>
                            </Link>

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
                        <div className="grid grid-cols-2 gap-4 sm:flex sm:items-center sm:justify-center max-w-md w-full mb-6">
                            {(data.options || []).map((option, index) => (
                                <Link
                                    key={option.title || index}
                                    href={option.href || "#"}
                                    className="group bg-white border border-secondary rounded-xl p-4 flex flex-col items-center transition-all duration-200 shadow-sm hover:shadow-lg cursor-pointer"
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