"use client";
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
        <div className="min-h-screen overflow-hidden flex flex-col items-center justify-center bg-white p-6">
            <div className="p-6 bg-white rounded-xl overflow-hidden  border border-gray-200 shadow-secondary shadow-2xl ">

                <motion.div
                    className="w-full max-w-2xl text-center"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="font-tagesschrift text-6xl md:text-8xl text-secondary font-bold">
                        somi
                    </h1>

                    <div className="relative w-full max-w-md aspect-video mx-auto ">
                        <Image
                            src="/getstarted.jpg"
                            alt="Weight Loss"
                            width={500}
                            height={400}
                            className="rounded-xl object-contain"
                            style={{ width: '100%', height: 'auto' }}
                            priority
                        />
                    </div>

                    <h2 className="text-2xl font-semibold mt-4 mb-2">
                        Start Your Weight Loss Journey Today!
                    </h2>

                    <p className="text-gray-700 mb-2">
                        No Hidden Fees. $0 Consultation Fee. No Subscriptions. Free Shipping.
                    </p>

                    <p className="text-green-600 font-medium mb-6">
                        Pay only when approved
                    </p>

                    <Link href="/getstarted/questions">
                        <button className="bg-secondary hover:bg-secondary text-white font-semibold py-3 px-6 rounded-full transition duration-300">
                            Let&apos;s Get Started
                        </button>
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};

export default LandingPage;
