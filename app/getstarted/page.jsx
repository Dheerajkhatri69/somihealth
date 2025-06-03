"use client"
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

const LandingPage = () => {
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let percent = 0;

        const interval = setInterval(() => {
            percent += 10;
            if (percent >= 100) {
                setProgress(100);
                clearInterval(interval);
                setTimeout(() => setLoading(false), 100); // extra 200ms for smoothness
            } else {
                setProgress(percent);
            }
        }, 100);

        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-white p-6">
                <div className="w-64">
                    <Progress value={progress} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen overflow-hidden flex flex-col md:flex-row items-center justify-center bg-white p-6">
            {/* Left Section - Text */}
            <motion.div
                className="w-full md:w-1/2 flex flex-col justify-center items-start text-left p-6"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
            >
                <h1 className="font-tagesschrift md:text-9xl text-6xl mb-2 text-secondary font-bold">somi</h1>

                <h2 className="text-2xl font-semibold mb-2 mt-4">
                    Start Your Weight Loss Journey Today!
                </h2>

                <p className="text-gray-700 mb-2">
                    No Hidden Fees. $0 Consultation Fee. No Subscriptions. Free Shipping.
                </p>

                <p className="text-gray-600 mb-4">
                    Fill out our brief 7-minute questionnaire. Within 24 hours, a qualified nurse practitioner will assess your suitability for GLP-1 treatment, helping you take a step towards your weight management goals.
                </p>

                <p className="text-green-600 font-medium mb-6">Only Pay When Approved</p>

                <Link href="/getstarted/questions">
                    <button className="bg-secondary hover:bg-secondary text-white font-semibold py-3 px-6 rounded-full transition duration-300">
                        Let&apos;s Get Started
                    </button>
                </Link>
            </motion.div>

            {/* Right Section - Image */}
            <motion.div
                className="w-full md:w-1/2 flex justify-center items-center p-6"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
            >
                <div className="relative w-full max-w-md aspect-video">
                    <Image
                        src="/getstarted.svg"
                        alt="Weight Loss"
                        width={500}
                        height={400}
                        className="rounded-xl object-contain"
                        style={{ width: '100%', height: 'auto' }} // maintain ratio
                        priority // ✅ this eliminates the LCP warning
                    />
                </div>
            </motion.div>
        </div>
    );
};

export default LandingPage;
