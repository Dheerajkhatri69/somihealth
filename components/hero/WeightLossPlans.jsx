"use client";

import Link from "next/link";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";

export default function WeightLossPlansV3() {
  const plans = [
    {
      name: "Compounded Semaglutide",
      img: "/hero/newsemaglutide.png",
      imgAlt: "Somi Compounded Semaglutide vial",
      priceLabel: "Starting At",
      currency: "$",
      price: 99,
      per: "/Month",
      primary: { label: "Get Started", href: "/getstarted" },
      secondary: { label: "Learn More", href: "/underdevelopmentmainpage/weight-loss/semaglutide" },
    },
    {
      name: "Compounded Tirzepatide",
      img: "/hero/newtirzepatide.png",
      imgAlt: "Somi Compounded Tirzepatide vial",
      priceLabel: "Starting At",
      currency: "$",
      price: 145,
      per: "/Month",
      primary: { label: "Get Started", href: "/getstarted" },
      secondary: { label: "Learn More", href: "/underdevelopmentmainpage/weight-loss/tirzepatide" },
    },
    {
      name: "Compounded Semaglutide",
      img: "/hero/newsemaglutide.png",
      imgAlt: "Somi Compounded Semaglutide vial",
      priceLabel: "Starting At",
      currency: "$",
      price: 99,
      per: "/Month",
      primary: { label: "Get Started", href: "/getstarted" },
      secondary: { label: "Learn More", href: "/underdevelopmentmainpage/weight-loss/semaglutide" },
    },
    {
      name: "Compounded Tirzepatide",
      img: "/hero/newtirzepatide.png",
      imgAlt: "Somi Compounded Tirzepatide vial",
      priceLabel: "Starting At",
      currency: "$",
      price: 145,
      per: "/Month",
      primary: { label: "Get Started", href: "/getstarted" },
      secondary: { label: "Learn More", href: "/underdevelopmentmainpage/weight-loss/tirzepatide" },
    },
    {
      name: "Compounded Tirzepatide",
      img: "/hero/newtirzepatide.png",
      imgAlt: "Somi Compounded Tirzepatide vial",
      priceLabel: "Starting At",
      currency: "$",
      price: 145,
      per: "/Month",
      primary: { label: "Get Started", href: "/getstarted" },
      secondary: { label: "Learn More", href: "/underdevelopmentmainpage/weight-loss/tirzepatide" },
    },
  ];

  return (
    <section className="w-full py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <h2 className=" text-center text-2xl font-bold sm:text-3xl">
          Plans
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 ">
          {plans.map((p, i) => (
            <CardContainer key={i} className="w-full">
              <CardBody
                className="
                  group/card relative w-full rounded-2xl
                  bg-darkprimary-foreground/20 shadow-sm ring-1 ring-black/5
                  flex flex-col items-center justify-between
                  p-6 sm:p-7
                  min-h-[340px] sm:min-h-[380px] md:min-h-[420px]
                "
              >

                {/* TOP */}
                <div className="z-10 w-full text-center">
                  <CardItem translateZ={40}>
                    <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-0.5 text-xs font-semibold text-secondary">
                      {p.priceLabel}
                    </div>
                  </CardItem>

                  <CardItem translateZ={60}>
                    <div className="mt-2 flex items-end justify-center gap-1.5">
                      <span className="text-xl font-semibold text-gray-900">{p.currency}</span>
                      <span className="text-4xl font-extrabold leading-none text-gray-900 sm:text-5xl">
                        {p.price}
                      </span>
                      <span className="mb-1 text-xs font-semibold text-gray-500">{p.per}</span>
                    </div>
                  </CardItem>

                  <CardItem translateZ={60}>
                    <h3 className="mt-1 text-lg font-bold tracking-tight sm:text-2xl font-SofiaSans">
                      {p.name}
                    </h3>
                  </CardItem>
                </div>

                {/* MIDDLE (bigger vial) */}
                <CardItem
                  translateZ={20}
                  className="relative z-10 row-start-2 flex items-center justify-center pt-2 pb-3"
                >
                  <div className="relative w-24 sm:w-28 md:w-32">
                    <span className="vial-shadow pointer-events-none absolute bottom-1 left-1/2 h-3 w-2/3 -translate-x-1/2 rounded-full" />
                    <img
                      src={p.img}
                      alt={p.imgAlt || p.name}
                      className="vial-img mx-auto block rotate-45 h-auto w-full select-none transition-transform duration-300 ease-out group-hover/card:-translate-y-0.5 group-hover/card:scale-[1.06]"
                      draggable="false"
                    />
                  </div>
                </CardItem>

                {/* BOTTOM */}
                <div className="z-10 mt-1 flex flex-col items-center justify-center gap-2 sm:flex-col lg:flex-row">
                  <CardItem
                    translateZ={10}
                    as={Link}
                    href={p.primary.href}
                    className="btn-hero inline-flex h-12 min-w-[200px] md:min-w-[160px] items-center justify-center gap-2 rounded-full bg-darkprimary px-5 text-sm font-semibold text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60"
                  >
                    {p.primary.label}
                    <ArrowRight />
                  </CardItem>

                  <CardItem
                    translateZ={10}
                    as={Link}
                    href={p.secondary.href}
                    className="fx86 inline-flex h-12 min-w-[200px] md:min-w-[160px] items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
                    style={{ "--fx86-base": "transparent", "--fx86-glow": "#364c781d" }}
                  >
                    {p.secondary.label}
                  </CardItem>
                </div>
              </CardBody>
            </CardContainer>
          ))}
        </div>
      </div>

      {/* helpers */}
      <style jsx>{`
        .vial-shadow {
          background: radial-gradient(closest-side, rgba(0, 0, 0, 0.28), transparent);
          opacity: 0.9;
          transform: translateY(6px) scale(0.85);
        }
        @media (hover: none) {
          .vial-img {
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
}

/* ---------- icons ---------- */
function ArrowRight() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CheckIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
