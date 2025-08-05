"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

/* ---------- Lightbox / Modal ---------- */
function VideoLightbox({ open, onClose, video }) {
  const vidRef = React.useRef(null);

  // Lock scroll when open
  React.useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  // Esc to close
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !video) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        // close only when clicking the backdrop
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-5xl">
        <div className="relative rounded-2xl bg-black p-0 shadow-lg ring-1 ring-white/10">
          {/* Close button — inside the container, on top of the video */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close video"
            className="absolute top-3 right-3 z-20 pointer-events-auto rounded-full bg-white/90 p-2 text-black shadow hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {/* Video (large, but not full screen) */}
          <video
            key={(video.srcMp4 || video.srcWebm) + (video.poster || "")}
            ref={vidRef}
            className="h-[65vh] w-full max-h-[85vh] rounded-2xl object-contain"
            controls
            autoPlay
            playsInline
            poster={video.poster}
            onClick={(e) => e.stopPropagation()}
          >
            {video.srcWebm && <source src={video.srcWebm} type="video/webm" />}
            {video.srcMp4 && <source src={video.srcMp4} type="video/mp4" />}
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Optional meta under the video */}
        {(video.title || video.subtitle || video.description) && (
          <div className="mt-3 text-white" onClick={(e) => e.stopPropagation()}>
            {video.subtitle && (
              <div className="text-xs font-semibold uppercase tracking-wide text-white/80">
                {video.subtitle}
              </div>
            )}
            {video.title && <h3 className="mt-1 text-lg font-semibold">{video.title}</h3>}
            {video.description && <p className="mt-1 text-sm text-white/80">{video.description}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Single Video Card ---------- */
function ReviewVideoCard({
  srcMp4,
  srcWebm,
  poster,
  title,
  subtitle,
  description,
  autoPlay = true,
  onOpen,
}) {
  const open = () =>
    onOpen &&
    onOpen({
      srcMp4,
      srcWebm,
      poster,
      title,
      subtitle,
      description,
    });

  return (
    <div className="relative overflow-hidden rounded-[32px]">
      <video
        className="h-full w-full max-h-[520px] object-cover"
        playsInline
        muted
        loop
        preload="metadata"
        poster={poster}
        autoPlay={autoPlay}
      >
        {srcWebm && <source src={srcWebm} type="video/webm" />}
        {srcMp4 && <source src={srcMp4} type="video/mp4" />}
        Your browser does not support the video tag.
      </video>

      {/* click overlay */}
      <button
        type="button"
        onClick={open}
        aria-label="Open video"
        className="absolute inset-0 z-10 cursor-pointer"
      />

      {/* Readability layers */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/70" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

      {/* Top-left: subtitle + title */}
      <div className="absolute left-5 top-5 right-5">
        {subtitle && (
          <div className="text-xs font-semibold uppercase tracking-wide text-white/80">{subtitle}</div>
        )}
        <h3 className="mt-1 text-xl font-bold text-white drop-shadow">{title}</h3>
      </div>

      {/* Bottom-left: description */}
      <div className="absolute bottom-5 left-5 right-6">
        <p className="max-w-[85%] text-sm text-white/90">{description}</p>
      </div>
    </div>
  );
}

/* ---------- Reviews (Carousel on mobile, 4-up paged Carousel on laptop/desktop) ---------- */
export default function ClientVideoReviews() {
  const videos = [
    {
      title: "Down 18% in 4 months",
      subtitle: "Semaglutide · Ayesha",
      description:
        "I finally stopped yo-yo dieting. The check-ins kept me on track and the shipping was seamless.",
      poster: "/hero/v1.png",
      srcMp4: "/hero/1.mov",
    },
    {
      title: "More energy, less stress",
      subtitle: "Tirzepatide · David",
      description:
        "Super simple. The plan fit my routine and I didn’t feel alone in the process.",
      poster: "/hero/v2.png",
      srcMp4: "/hero/2.mp4",
    },
    {
      title: "Real results that last",
      subtitle: "Semaglutide · Sara",
      description:
        "Weekly nudges and clear guidance—no guesswork. I’m the most consistent I’ve ever been.",
      poster: "/hero/v3.png",
      srcMp4: "/hero/3.mov",
    },
    {
      title: "Confidence is back",
      subtitle: "Tirzepatide · Hamza",
      description:
        "The plan was realistic. I followed it, the weight came off, and I feel great.",
      poster: "/hero/v4.png",
      srcMp4: "/hero/4.mov",
    },
  ];

  // Lightbox state
  const [open, setOpen] = React.useState(false);
  const [activeVideo, setActiveVideo] = React.useState(null);
  const openVideo = (v) => {
    setActiveVideo(v);
    setOpen(true);
  };

  /* ----- helpers ----- */
  const chunk = React.useCallback((arr, size) => {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  }, []);
  const pages = React.useMemo(() => chunk(videos, 4), [videos, chunk]);

  /* Mobile carousel control (play the active) */
  const [apiMobile, setApiMobile] = React.useState(null);
  const [currentMobile, setCurrentMobile] = React.useState(0);
  const videoRefs = React.useRef([]);

  React.useEffect(() => {
    if (!apiMobile) return;
    const onSelect = () => {
      const i = apiMobile.selectedScrollSnap();
      setCurrentMobile(i);
      videoRefs.current.forEach((v, idx) => {
        if (!v) return;
        if (idx === i) v.play().catch(() => {});
        else v.pause();
      });
    };
    onSelect();
    apiMobile.on("select", onSelect);
    return () => apiMobile.off("select", onSelect);
  }, [apiMobile]);

  /* Desktop carousel (4-up pages) */
  const [apiDesk, setApiDesk] = React.useState(null);
  const [currentDesk, setCurrentDesk] = React.useState(0);
  React.useEffect(() => {
    if (!apiDesk) return;
    const onSelect = () => setCurrentDesk(apiDesk.selectedScrollSnap());
    onSelect();
    apiDesk.on("select", onSelect);
    return () => apiDesk.off("select", onSelect);
  }, [apiDesk]);

  return (
    <section className="w-full py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <header className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-SofiaSans font-bold sm:text-3xl">
            From stuck to thriving.
          </h2>
        </header>

        {/* --- Mobile: 1 per slide --- */}
        <div className="lg:hidden">
          <Carousel setApi={setApiMobile} opts={{ align: "start", loop: false }} className="w-full">
            <CarouselContent>
              {videos.map((v, i) => (
                <CarouselItem id={`review-slide-${i}`} key={v.title} className="basis-full">
                  <Card className="border-0 bg-transparent shadow-none">
                    <CardContent className="p-0">
                      <div className="relative overflow-hidden rounded-[32px]">
                        <video
                          ref={(el) => (videoRefs.current[i] = el)}
                          className="h-full w-full max-h-[520px] object-cover"
                          playsInline
                          muted
                          loop
                          preload="metadata"
                          poster={v.poster}
                          onLoadedData={() => {
                            if (i === currentMobile) videoRefs.current[i]?.play().catch(() => {});
                          }}
                        >
                          {v.srcMp4 && <source src={v.srcMp4} type="video/mp4" />}
                          Your browser does not support the video tag.
                        </video>

                        {/* click to open */}
                        <button
                          type="button"
                          aria-label="Open video"
                          onClick={() => openVideo(v)}
                          className="absolute inset-0 z-10"
                        />

                        {/* overlays + text */}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/70" />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                        <div className="absolute left-5 top-5 right-5">
                          {v.subtitle && (
                            <div className="text-xs font-semibold uppercase tracking-wide text-white/80">
                              {v.subtitle}
                            </div>
                          )}
                          <h3 className="mt-1 text-xl font-bold text-white drop-shadow">{v.title}</h3>
                        </div>
                        <div className="absolute bottom-5 left-5 right-6">
                          <p className="max-w-[90%] text-sm text-white/90">{v.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>

          {/* Mobile dots */}
          <div className="mt-5 flex justify-center gap-3" role="tablist" aria-label="Client review slides">
            {videos.map((_, i) => {
              const active = i === currentMobile;
              return (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls={`review-slide-${i}`}
                  onClick={() => apiMobile && apiMobile.scrollTo(i)}
                  className={`h-1.5 w-24 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 ${
                    active ? "bg-secondary" : "bg-secondary/40 hover:bg-secondary/60"
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* --- Laptop/Desktop: 4-up paged carousel --- */}
        <div className="hidden lg:block">
          <Carousel setApi={setApiDesk} opts={{ align: "start", loop: false }} className="w-full">
            <CarouselContent>
              {pages.map((page, pageIndex) => (
                <CarouselItem key={`page-${pageIndex}`} className="basis-full">
                  <div className="grid grid-cols-4 gap-6 md:gap-8">
                    {page.map((v, idx) => (
                      <ReviewVideoCard key={`${v.title}-${idx}`} {...v} autoPlay onOpen={openVideo} />
                    ))}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>

          {/* Desktop dots: one per page */}
          <div className="mt-5 flex justify-center gap-3" role="tablist" aria-label="Client review pages">
            {pages.map((_, i) => {
              const active = i === currentDesk;
              return (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => apiDesk && apiDesk.scrollTo(i)}
                  className={`h-2 w-10 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 ${
                    active ? "bg-secondary" : "bg-secondary/40 hover:bg-secondary/60"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <VideoLightbox
        open={open}
        onClose={() => setOpen(false)}
        video={activeVideo}
      />
    </section>
  );
}
