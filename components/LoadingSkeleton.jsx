'use client';

import { useEffect, useState } from 'react';

// Skeleton components for different UI elements
export function NavbarSkeleton() {
  return (
    <header className="sticky top-0 z-50 bg-white">
      <div className="relative border-b">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          {/* Mobile hamburger skeleton */}
          <div className="h-6 w-6 rounded bg-gray-200 animate-pulse md:hidden" />
          
          {/* Brand skeleton */}
          <div className="h-12 w-32 rounded bg-gray-200 animate-pulse" />
          
          {/* Desktop nav items skeleton */}
          <div className="hidden items-center gap-2 md:flex">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 w-20 rounded-full bg-gray-200 animate-pulse" />
            ))}
          </div>
          
          {/* Right actions skeleton */}
          <div className="hidden items-center gap-3 md:flex">
            <div className="h-8 w-24 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-8 w-16 rounded-full bg-gray-200 animate-pulse" />
          </div>
          
          {/* Mobile icons skeleton */}
          <div className="flex items-center gap-4 md:hidden">
            <div className="h-6 w-6 rounded bg-gray-200 animate-pulse" />
            <div className="h-6 w-6 rounded bg-gray-200 animate-pulse" />
          </div>
        </nav>
      </div>
    </header>
  );
}

export function MegaPanelSkeleton() {
  return (
    <div className="w-full border-t rounded-b-3xl bg-lightprimary">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 md:grid-cols-12 md:px-6">
        {/* Watermark skeleton */}
        <div className="md:col-span-1">
          <div className="h-40 w-4 rounded bg-gray-200 animate-pulse" />
        </div>
        
        {/* Content columns skeleton */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="md:col-span-3 space-y-4">
            <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="h-8 w-full rounded bg-gray-200 animate-pulse" />
              ))}
            </div>
          </div>
        ))}
        
        {/* CTA section skeleton */}
        <div className="md:col-span-4">
          <div className="h-4 w-24 rounded bg-gray-200 animate-pulse mb-4" />
          <div className="aspect-[16/11] rounded-2xl bg-gray-200 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="space-y-4">
        {/* Image skeleton */}
        <div className="aspect-square rounded-lg bg-gray-200 animate-pulse" />
        
        {/* Content skeleton */}
        <div className="space-y-2">
          <div className="h-6 w-3/4 rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-1/2 rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-2/3 rounded bg-gray-200 animate-pulse" />
        </div>
        
        {/* Price skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-6 w-16 rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-12 rounded bg-gray-200 animate-pulse" />
        </div>
        
        {/* Button skeleton */}
        <div className="h-10 w-full rounded-lg bg-gray-200 animate-pulse" />
      </div>
    </div>
  );
}

export function SectionHeaderSkeleton() {
  return (
    <div className="text-center space-y-4">
      <div className="h-12 w-96 mx-auto rounded bg-gray-200 animate-pulse" />
      <div className="h-4 w-64 mx-auto rounded bg-gray-200 animate-pulse" />
    </div>
  );
}

export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <NavbarSkeleton />
      <main className="px-4 md:px-6">
        <div className="mx-auto max-w-6xl py-12 md:py-16 space-y-16">
          <SectionHeaderSkeleton />
          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}


// Categories grid skeleton
export function CategoriesGridSkeleton() {
  return (
    <section className="w-full bg-[#F4F4F8] py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Mobile skeleton */}
        <div className="lg:hidden">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="relative overflow-hidden rounded-[32px] bg-gray-200" style={{ aspectRatio: "4 / 5" }}>
                <div className="absolute inset-0 bg-gradient-to-b from-gray-300/20 via-gray-300/0 to-gray-300/70" />
                <div className="absolute left-6 top-6">
                  <div className="h-8 w-32 rounded bg-gray-300 animate-pulse" />
                </div>
                <div className="absolute bottom-4 left-4">
                  <div className="h-10 w-24 rounded-full bg-gray-300 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Desktop skeleton */}
        <div className="hidden lg:grid grid-cols-4 gap-6 md:gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="relative overflow-hidden rounded-[32px] bg-gray-200" style={{ aspectRatio: "4 / 5" }}>
              <div className="absolute inset-0 bg-gradient-to-b from-gray-300/20 via-gray-300/0 to-gray-300/70" />
              <div className="absolute left-6 top-6">
                <div className="h-8 w-32 rounded bg-gray-300 animate-pulse" />
              </div>
              <div className="absolute bottom-4 left-4">
                <div className="h-10 w-24 rounded-full bg-gray-300 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Weight loss plans skeleton
export function WeightLossPlansSkeleton() {
  return (
    <section className="w-full py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="h-8 w-24 mx-auto rounded bg-gray-200 animate-pulse mb-8" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-gray-100 p-6 sm:p-7 min-h-[340px] sm:min-h-[380px] md:min-h-[420px]">
              <div className="flex flex-col items-center justify-between h-full">
                <div className="w-full text-center space-y-4">
                  <div className="h-6 w-20 mx-auto rounded bg-gray-200 animate-pulse" />
                  <div className="h-12 w-24 mx-auto rounded bg-gray-200 animate-pulse" />
                  <div className="h-8 w-32 mx-auto rounded bg-gray-200 animate-pulse" />
                </div>
                <div className="w-24 h-24 rounded bg-gray-200 animate-pulse" />
                <div className="w-full space-y-2">
                  <div className="h-12 w-full rounded-full bg-gray-200 animate-pulse" />
                  <div className="h-12 w-full rounded-full bg-gray-200 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Main loading component with fade-in animation
export function LoadingPage({ children, isLoading, fallback = <PageLoadingSkeleton /> }) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isLoading]);

  if (isLoading) {
    return fallback;
  }

  return (
    <div className={`transition-opacity duration-300 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
      {children}
    </div>
  );
}

// Hook for managing loading states
export function useLoadingState(initialState = true) {
  const [isLoading, setIsLoading] = useState(initialState);
  const [error, setError] = useState(null);

  const startLoading = () => {
    setIsLoading(true);
    setError(null);
  };

  const stopLoading = (err = null) => {
    setIsLoading(false);
    if (err) setError(err);
  };

  return {
    isLoading,
    error,
    startLoading,
    stopLoading
  };
}
