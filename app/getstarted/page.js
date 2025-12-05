"use client";
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

const LandingPage = () => {
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
                setTimeout(() => setLoading(false), 200); // slight pause after reaching 100%
            }
        }, 80); // adjust speed if needed
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
                <div className="min-h-[100dvh] overflow-hidden flex flex-col items-center justify-center bg-white p-6">

                    <div className="p-6 bg-white rounded-xl overflow-hidden  border border-gray-200 shadow-secondary shadow-2xl ">

                        <div className="w-full max-w-2xl text-center">
                            <h1 className="font-tagesschrift text-6xl md:text-8xl text-secondary font-bold">
                                somi
                            </h1>

                            <div className="relative w-[300px] h-[300px] mx-auto">
                                <Image
                                    src="/getstarted.jpg"
                                    alt="Weight Loss"
                                    fill
                                    className="rounded-xl object-contain"
                                    priority
                                />
                            </div>

                            <h2 className="text-2xl font-semibold mt-4 mb-2">
                                Start Your Weight Loss Journey Today!
                            </h2>

                            <p className="text-gray-700 mb-6">
                                No hidden fees, No monthly subscription, Free Expedited shipping
                            </p>


                            <Link href="/getstarted/questions">
                                <button className="bg-secondary hover:bg-secondary text-white font-semibold py-3 px-6 rounded-full transition duration-300">
                                    Let&apos;s Get Started
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default LandingPage;
