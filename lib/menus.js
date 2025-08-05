// lib/menus.js
export const MENUS = {
  "Weight Loss": {
    discover: { label: "Weight Loss", href: "/underdevelopmentmainpage/weight-loss" },
    treatments: [
      { label: "Compounded Semaglutide", href: "/underdevelopmentmainpage/weight-loss/semaglutide", img: "/hero/semaglutide.png" },
      { label: "Compounded Tirzepatide", href: "/underdevelopmentmainpage/weight-loss/tirzepatide", img: "/hero/tirzepatide.png" },
      { label: "Oral Semaglutide", href: "/underdevelopmentmainpage/weight-loss/oral-semaglutide", img: "/hero/tirzepatide.png", badge: "NEW" },
    ],
    cta: {
      title: "Personalized\nWeight Loss",
      button: { label: "Get Started", href: "/getstarted" },
      img: "/hero/getstarted1.png",
    },
  },
  "Longevity": {
    discover: { label: "Longevity", href: "/underdevelopmentmainpage/longevity" },
    treatments: [
      { label: "B-12 Shots", href: "/underdevelopmentmainpage/energy-mood/b12", img: "/hero/tirzepatide.png" },
      { label: "Vitamin IV", href: "/underdevelopmentmainpage/energy-mood/iv", img: "/hero/tirzepatide.png" },
      { label: "Stress Support", href: "/underdevelopmentmainpage/energy-mood/stress", img: "/hero/tirzepatide.png" },
    ],
    cta: {
      title: "Boost Energy\n& Mood",
      button: { label: "Get Started", href: "/getstarted" },
      img: "/hero/second1.png",
    },
  },
  "Sexual Health": {
    discover: { label: "Sexual Health", href: "/underdevelopmentmainpage/sexual-health" },
    treatments: [
      { label: "Hormone Support", href: "/underdevelopmentmainpage/strength-vitality/hormone", img: "/hero/tirzepatide.png" },
      { label: "Muscle Recovery", href: "/underdevelopmentmainpage/strength-vitality/recovery", img: "/hero/tirzepatide.png" },
      { label: "Performance Pack", href: "/underdevelopmentmainpage/strength-vitality/performance", img: "/hero/tirzepatide.png" },
    ],
    cta: {
      title: "Stronger.\nFitter.",
      button: { label: "Get Started", href: "/getstarted" },
      img: "/hero/thired1.png",
    },
  },
  "Skin+Hair": {
    discover: { label: "Skin+Hair", href: "/underdevelopmentmainpage/Skin+Hair" },
    treatments: [
      { label: "Hormone Support", href: "/underdevelopmentmainpage/strength-vitality/hormone", img: "/hero/tirzepatide.png" },
      { label: "Muscle Recovery", href: "/underdevelopmentmainpage/strength-vitality/recovery", img: "/hero/tirzepatide.png" },
      { label: "Performance Pack", href: "/underdevelopmentmainpage/strength-vitality/performance", img: "/hero/tirzepatide.png" },
    ],
    cta: {
      title: "Stronger.\nFitter.",
      button: { label: "Get Started", href: "/getstarted" },
      img: "/hero/thired1.png",
    },
  },
};

export function slugify(str) {
  if (!str) return "";
  return str
    .toString()
    .trim()
    .replace(/\+/g, " ")        // "+" looks better as space before hyphenation
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .toLowerCase();
}

export function getMenuBySlug(slug) {
  const entries = Object.entries(MENUS);
  for (const [key, value] of entries) {
    if (slugify(key) === slug.toLowerCase()) return { key, menu: value };
  }
  return null;
}
