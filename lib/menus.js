// lib/menus.js
export const MENUS = {
  "Weight Loss": {
    showInNavbar: true,
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
    showInNavbar: true,
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
    showInNavbar: true,
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
    showInNavbar: true,
    discover: { label: "Skin+Hair", href: "/underdevelopmentmainpage/skin-hair" },
    treatments: [
      { label: "Hormone Support", href: "/underdevelopmentmainpage/strength-vitality/hormone", img: "/hero/tirzepatide.png" },
      { label: "Muscle Recovery", href: "/underdevelopmentmainpage/strength-vitality/recovery", img: "/hero/tirzepatide.png" },
      { label: "Performance Pack", href: "/underdevelopmentmainpage/strength-vitality/performance", img: "/hero/tirzepatide.png" },
    ],
    cta: {
      title: "Stronger.\nFitter.",
      button: { label: "Get Started", href: "/getstarted" },
      img: "/hero/4.jpg",
    },
  },
  "General Health": {
    showInNavbar: true,
    type: "categorized", // New type for categorized menus
    discover: { label: "General Health", href: "/underdevelopmentmainpage/general-health" },
    categories: [
      {
        title: "Direct Primary Care",
        items: [
          { label: "High Blood Pressure", href: "/underdevelopmentmainpage/general-health/high-blood-pressure" },
          { label: "Diabetes", href: "/underdevelopmentmainpage/general-health/diabetes" },
          { label: "High Cholesterol", href: "/underdevelopmentmainpage/general-health/high-cholesterol" },
          { label: "Hypothyroidism", href: "/underdevelopmentmainpage/general-health/hypothyroidism" },
          { label: "Acid Reflux", href: "/underdevelopmentmainpage/general-health/acid-reflux" },
          { label: "Hot Flashes", href: "/underdevelopmentmainpage/general-health/hot-flashes" },
        ]
      },
      {
        title: "Same-day Care",
        items: [
          { label: "Yeast Infection", href: "/underdevelopmentmainpage/general-health/yeast-infection" },
          { label: "Bacterial Vaginosis (BV)", href: "/underdevelopmentmainpage/general-health/bv" },
          { label: "Insomnia", href: "/underdevelopmentmainpage/general-health/insomnia" },
          { label: "Upper Respiratory Infection", href: "/underdevelopmentmainpage/general-health/uri" },
          { label: "Urinary Tract Infection", href: "/underdevelopmentmainpage/general-health/uti" },
          { label: "Flu", href: "/underdevelopmentmainpage/general-health/flu" },
          { label: "Paxlovid", href: "/underdevelopmentmainpage/general-health/paxlovid" },
        ]
      },
      {
        title: "Medication Refill",
        items: [
          { label: "Short Bridge Refill", href: "/underdevelopmentmainpage/general-health/short-bridge-refill" },
          { label: "Emergency Rx Refill", href: "/refills", isLink: true }, // This is a direct link
        ]
      }
    ],
    cta: {
      title: "Comprehensive\nHealthcare",
      button: { label: "Get Started", href: "/getstarted" },
      img: "/hero/3.png",
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

// Helper function to get grid items for CategoriesGrid
export function getGridItems() {
  // Map specific images for the grid display
  const gridImageMap = {
    "Weight Loss": "/hero/1.jpg",
    "Longevity": "/hero/2.png",
    "Sexual Health": "/hero/3.png",
    "Skin+Hair": "/hero/4.jpg",
    "General Health": "/hero/3.png"
  };

  return Object.entries(MENUS).map(([key, menu]) => ({
    title: key,
    img: gridImageMap[key] || menu.cta.img, // Use grid image if available, fallback to CTA image
    href: menu.discover.href,
  }));
}

// Helper function to get only navbar menu items
export function getNavbarItems() {
  return Object.entries(MENUS)
    .filter(([key, menu]) => menu.showInNavbar)
    .map(([key, menu]) => ({ key, menu }));
}
