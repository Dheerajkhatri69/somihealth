"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LoginReview from "@/components/LoginReview";

export default function RegisterPage() {
    return (
        <div className="min-h-screen w-full bg-white flex items-center justify-center relative">
            {/* Back link */}
            <Link
                href="/"
                className="absolute left-2 top-2 flex text-xs items-center hover:underline text-secondary cursor-pointer mt-2"
            >
                <ChevronLeft size={18} />
                Back
            </Link>

            {/* Left side: Content */}
            <div className="flex flex-col items-center w-full p-4 md:w-1/2">
                <div className="text-center mb-4">
                    <Link href="/" className="inline-block">
                        <div className="text-4xl font-extrabold font-tagesschrift tracking-tight">
                            somi
                        </div>
                    </Link>
                </div>

                <Card className="w-full max-w-sm border-0 border-t-2 border-b-2 border-secondary">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-xl text-center">
                            Join somi
                        </CardTitle>
                        <CardDescription className="text-center">
                            Get started with your health journey
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4 text-center">
                        <p className="text-slate-600">
                            Please purchase any service so joinsomi able to provide you login credentials via email.
                        </p>

                        <Button asChild className="w-full rounded-lg bg-secondary text-white hover:bg-secondary/90">
                            <Link href="/pricing">
                                Purchase Service
                            </Link>
                        </Button>

                        <p className="text-slate-600">
                            From the login dashboard you can track your service information with the latest options
                        </p>

                        <div className="pt-4">
                            <p className="text-sm text-gray-600 mb-2">
                                Already have an account?
                            </p>
                            <Button asChild className="w-full rounded-lg bg-secondary text-white hover:bg-secondary/90">
                                <Link href="/login">
                                    Sign in
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right side: Hero & Reviews (Identical to Login) */}
            <div className="hidden md:flex flex-col w-1/2 h-screen bg-[#f5f7f9] overflow-hidden">

                {/* Top 70% - Service Grid */}
                <div className="h-[70vh] w-full p-4">
                    <div className="grid grid-cols-2 gap-4 h-full w-full">
                        {[
                            { title: 'Weight Loss', image: 'https://res.cloudinary.com/dvmbfolrm/image/upload/v1764288147/fileUploader/m8wiorldootbj1do2fd0.jpg' },
                            { title: 'Longevity', image: 'https://res.cloudinary.com/dvmbfolrm/image/upload/v1764026233/fileUploader/pz4fiesttenycwmwzvwv.jpg' },
                            { title: 'Erectile Dysfunction', image: 'https://res.cloudinary.com/dvmbfolrm/image/upload/v1764026405/fileUploader/b2cblfpp9vb4qwp3ac9g.jpg' },
                            { title: 'Skin & Hair', image: 'https://res.cloudinary.com/dvmbfolrm/image/upload/v1764026867/fileUploader/w1jmxvaiwra357qqag1k.jpg' }
                        ].map((item) => (
                            <div key={item.title} className="group relative w-full h-full rounded-2xl overflow-hidden bg-slate-200">
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                                <div className="absolute bottom-3 left-3 right-3">
                                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg inline-block">
                                        <p className="text-xs font-bold text-slate-900">{item.title}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom 30% - Review Component */}
                <div className="h-[30vh] w-full flex items-center justify-center p-8 bg-white/50 backdrop-blur-xl">
                    <div className="w-full">
                        <LoginReview />
                    </div>
                </div>

            </div>
        </div>
    );
}
