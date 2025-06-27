"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

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
        <div className="min-h-[100dvh] overflow-hidden flex flex-col items-center justify-center bg-white p-6">

            <div className="p-6 bg-white rounded-xl max-w-[500px] overflow-hidden  border border-gray-200 shadow-secondary shadow-2xl ">

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
                        We Appreciate Your Referral!
                    </h2>

                    <p className="text-gray-700 mb-2">
                        Whether you&apos;re a provider, pharmacy, a friend or family member, we&apos;d love to hear from you.
                    </p>
                    <p className="text-gray-700 mb-2">
                        We will need some basic information to get started.
                    </p>


                    <Link href="/referrals/questions">
                        <button className="bg-secondary hover:bg-secondary text-white font-semibold py-3 px-6 rounded-full transition duration-300">
                            Start
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
