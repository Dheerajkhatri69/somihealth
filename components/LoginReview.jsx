"use client";

import * as React from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

// Star Component
const Star = ({ className = "h-4 w-4", fill = "#22c55e" }) => (
    <svg viewBox="0 0 24 24" className={className} fill={fill} aria-hidden="true">
        <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.401 8.168L12 18.896 4.665 23.165l1.401-8.168L.132 9.21l8.2-1.192L12 .587z" />
    </svg>
);

const Verified = ({ className = "h-5 w-5" }) => (
    <svg viewBox="0 0 24 24" className={className} fill="#3B82F6">
        <path d="M12 2l2.1 2.1 2.97-.49-.49 2.97L19.5 9l-2.02 2.02.49 2.97-2.97-.49L12 16.5l-2.1-2.1-2.97.49.49-2.97L5 9l2.02-2.02-.49-2.97 2.97.49L12 2zm-1.2 10.6l1.8-1.8 2.7-2.7-1.06-1.06-2.44 2.44-1.44-1.44-1.06 1.06 2.5 2.5z" />
    </svg>
);

function ReviewCard({ quote, author, verified = true }) {
    return (
        <div className="w-full bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            {/* Rating */}
            <div className="mb-3 flex items-center justify-between">
                <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} />
                    ))}
                </div>
                {verified && (
                    <span className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-full px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        <Verified className="h-3 w-3" />
                        Verified
                    </span>
                )}
            </div>

            {/* Quote */}
            <blockquote className="mb-4">
                <p className="text-base text-slate-700 leading-relaxed font-medium">
                    &quot;{quote}&quot;
                </p>
            </blockquote>

            {/* Footer */}
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                    {author.charAt(0)}
                </div>
                <div>
                    <p className="text-sm font-semibold text-slate-900">{author}</p>
                    <p className="text-xs text-slate-500">Patient</p>
                </div>
            </div>
        </div>
    );
}

const DEFAULT_REVIEWS = [
    {
        quote: "I wasn't ready for injections and honestly didn't think oral semaglutide would do much, but I've been really surprised.",
        author: "Amanda W.",
    },
    {
        quote: "My provider adjusted the plan twice and it kept working. Shipping was fast and support replied within a day.",
        author: "Rahul S.",
    },
    {
        quote: "Checked in every month and stayed consistent. I have more energy than I did last year.",
        author: "Sofia M.",
    },
    {
        quote: "Support team was on it. Refill came on time and the guidance was clear.",
        author: "Dennis M.",
    },
];

export default function LoginReview() {
    return (
        <div className="w-full px-12">
            <Carousel opts={{ align: "start", loop: true }} className="w-full relative">
                <CarouselContent>
                    {DEFAULT_REVIEWS.map((r, idx) => (
                        <CarouselItem key={idx} className="basis-full">
                            <ReviewCard {...r} />
                        </CarouselItem>
                    ))}
                </CarouselContent>

                <CarouselPrevious className="absolute -left-12 top-1/2 -translate-y-1/2 h-8 w-8 bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm" />
                <CarouselNext className="absolute -right-12 top-1/2 -translate-y-1/2 h-8 w-8 bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm" />
            </Carousel>
        </div>
    );
}
