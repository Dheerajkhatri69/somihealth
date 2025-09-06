// components/BenefitsMosaic.jsx
"use client";

import Image from "next/image";
import * as Icons from "lucide-react";

function Icon({ name = "Leaf", className }) {
  const Cmp = Icons[name] || Icons.Leaf;
  return <Cmp className={className} />;
}

const FALLBACK = { src: "/hero/product.png", alt: "Product" };

// 5 constant images (replace with your assets)
const FIXED_LEFT_IMAGES = [
  { src: "/hero/compounded-glp1.png", alt: "Personalized to your biology" },
  { src: "/hero/sign.png",         alt: "Clinic sign" },
  { src: "/hero/portrait-1.png",   alt: "Portrait 1" },
  { src: "/hero/newsemaglutide.png", alt: "Product on set" },
  { src: "/hero/portrait-2.png",   alt: "Portrait 2" },
];

// -------- Helpers for configurable sizes / layout --------
const DEFAULT_TILE_SIZES = [
  "h-28 md:h-32",
  "h-80 md:h-80",
  "h-72 md:h-80",
  "h-64 md:h-64",
  "h-64 md:h-64",
  "h-60 md:h-64",
];

const COLUMN_CLASSES = { 1: "columns-1", 2: "columns-2", 3: "columns-3", 4: "columns-4" };
const GAP_CLASSES = { 0: "gap-0", 1: "gap-1", 2: "gap-2", 3: "gap-3", 4: "gap-4", 5: "gap-5", 6: "gap-6", 8: "gap-8" };

function resolveTileSize(tileSizes, i) {
  const t = tileSizes?.[i];
  if (!t) return "h-64 md:h-64";
  if (typeof t === "string") return t;
  // object form: { h: 'h-64', md: 'md:h-72' }
  const { h = "h-64", md = "md:h-64" } = t;
  return `${h} ${md}`;
}

/**
 * Props:
 *  - data.rightCards
 *  - data.leftTiles: [{ type:"image", src, alt }]
 *  - dynamicIndex (0..5): where the dynamic image goes (default 3)
 *  - centerBadge: { iconName?: string }
 *  - tileSizes: string[] | {h, md}[]   // length 6, tailwind height classes
 *  - columns: 1|2|3|4                  // masonry columns (default 2)
 *  - gap: 0|1|2|3|4|5|6|8              // column gap (default 4)
 */
export default function BenefitsMosaic({
  data,
  dynamicIndex = 3,
  centerBadge = { iconName: "Leaf" },
  tileSizes = DEFAULT_TILE_SIZES,
  columns = 2,
  gap = 4,
}) {
  const { leftTiles = [], rightCards = [] } = data;

  // dynamic image from data - get the first image tile
  const dynamicFromData = leftTiles.find((t) => t?.type === "image" && t?.src) || FALLBACK;

  // construct 6-image list (5 fixed + 1 dynamic)
  // Use uploaded images from leftTiles if available, otherwise use fixed images
  const uploadedImages = leftTiles.filter(t => t?.type === "image" && t?.src);
  const six = Array.from({ length: 6 }, (_, i) => {
    if (i === dynamicIndex) return dynamicFromData;
    
    // Use uploaded images first, then fall back to fixed images
    if (uploadedImages[i]) {
      return {
        src: uploadedImages[i].src,
        alt: uploadedImages[i].alt || "Uploaded image"
      };
    }
    
    const fixedMap = [0, 1, 2, 3, 4, null];
    const j = fixedMap[i];
    return j !== null ? FIXED_LEFT_IMAGES[j] : FALLBACK;
  });

  const columnsClass = COLUMN_CLASSES[columns] || COLUMN_CLASSES[2];
  const gapClass = GAP_CLASSES[gap] || GAP_CLASSES[4];

  return (
    <section className="grid gap-8 md:grid-cols-2">
      {/* LEFT: Masonry */}
      <div className="relative">
        <div className={`${columnsClass} ${gapClass} [column-fill:_balance]`}>
          {six.map((img, i) => (
            <div
              key={i}
              className="mb-4 break-inside-avoid overflow-hidden rounded-[22px] bg-gray-100 ring-1 ring-black/5 shadow-sm"
            >
              <div className={`relative w-full ${resolveTileSize(tileSizes, i)}`}>
                <Image
                  src={img.src}
                  alt={img.alt || "Image"}
                  fill
                  className="object-cover"
                  sizes="(max-width:768px) 50vw, 30vw"
                  priority={i === 0}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Two circular badges (positions kept from your code) */}
        <div className="pointer-events-none absolute left-1/2 top-1/3 z-10 -translate-x-1/2 -translate-y-1/2">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-lightprimary text-secondary ring-8 ring-white shadow-md">
            <Icon name={centerBadge.iconName} className="h-6 w-6" />
          </div>
        </div>
        <div className="pointer-events-none absolute left-1/2 bottom-1/3 z-10 -translate-x-1/2 translate-y-1/2">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-lightprimary text-secondary ring-8 ring-white shadow-md">
            <Icons.Activity className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* RIGHT: benefit cards */}
      <div className="space-y-5">
        {rightCards.map((c, idx) => (
          <div key={idx} className="rounded-2xl bg-lightprimary p-5">
            <div className="flex items-center gap-3 font-SofiaSans">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white">
                <Icon name={c.icon} className="h-5 w-5 text-darkprimary" />
              </span>
              <h3 className="text-lg font-semibold">{c.title}</h3>
            </div>
            <p className="mt-2 text-gray-700">{c.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
