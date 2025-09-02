// lib/products.js
import { slugify } from "./slug";

// --- DOM demo data (extend anytime) ---
export const PRODUCT_CATALOG = {
    "weight-loss": {
        semaglutide: {
            showInPlans: true,
            label: "Semaglutide Injections",
            shortLabel: "Compounded Semaglutide",
            heroImage: "/hero/semaglutide.png",
            price: 99,
            unit: "/mo",
            inStock: true,
            ratingLabel: "Excellent",
            trustpilot: "5",
            bullets: [
                { icon: "Truck", text: "Fast approval, fast shipping" },
                { icon: "BadgeDollarSign", text: "No membership fees. Same price at every dose." },
                { icon: "SmilePlus", text: "30-day risk-free. Love it or your money back." },
                { icon: "Syringe", text: "Full home injection kit included" },
            ],
            description:
                "Our compounded Semaglutide is a personalized formulation of GLP-1, crafted to fit your lifestyle and accelerate your weight loss journey.",
            ctas: {
                primary: { label: "Get started in 5 minutes", href: "/getstarted" },
                secondary: { label: "Book a free consultation", href: "/consult" },
            },
            // Section 2
            howItWorks: {
                heading: "How Does Compounded Semaglutide Help You Lose Weight?",
                intro:
                    "Compounded Semaglutide mimics GLP-1, a natural hormone that helps regulate appetite and blood sugar.",
            },
            // Section 3
            benefits: {
                leftTiles: [
                    { type: "image", src: "/hero/dynamic-safe.jpg", alt: "Dynamic tile" } // <- used
                ],
                rightCards: [
                    { icon: "Apple", title: "Reduces Appetite", body: "Helps you eat less and control cravings." },
                    { icon: "Droplets", title: "Regulates Blood Sugar", body: "Prevents spikes and crashes for steady energy." },
                    { icon: "Flame", title: "Boosts Metabolic Efficiency", body: "Enhances how your body uses energy." },
                    { icon: "Gauge", title: "Improves Portion Control", body: "Supports long-term weight management." },
                ],
            },
        },

        tirzepatide: {
            showInPlans: true,
            label: "Tirzepatide Injections",
            shortLabel: "Compounded Tirzepatide",
            heroImage: "/hero/tirzepatide.png",
            price: 145,
            unit: "/mo",
            inStock: true,
            ratingLabel: "Excellent",
            trustpilot: "5",
            bullets: [
                { icon: "Truck", text: "Fast approval, fast shipping" },
                { icon: "BadgeDollarSign", text: "Transparent pricing. No membership fees." },
                { icon: "SmilePlus", text: "30-day risk-free for new patients." },
                { icon: "Syringe", text: "Home injection kit included" },
            ],
            description:
                "Compounded Tirzepatide is a dual-agonist that supports appetite control and glucose management for advanced results.",
            ctas: {
                primary: { label: "Get started in 5 minutes", href: "/getstarted" },
                secondary: { label: "Book a free consultation", href: "/consult" },
            },
            howItWorks: {
                heading: "How Does Compounded Tirzepatide Support Weight Loss?",
                intro: "A dual GIP/GLP-1 agonist that targets appetite and glucose regulation together.",
            },
            benefits: {
                leftTiles: [
                    { type: "image", src: "/hero/dynamic-safe.jpg", alt: "Dynamic tile" } // <- used
                ],
                rightCards: [
                    { icon: "Apple", title: "Controls Cravings", body: "Feel full sooner and longer." },
                    { icon: "Droplets", title: "Balances Glucose", body: "Supports stable energy and mood." },
                    { icon: "Flame", title: "Metabolic Support", body: "Optimizes fuel usage." },
                    { icon: "Gauge", title: "Portion Control", body: "Easier adherence to plans." },
                ],
            },
        },

        "oral-semaglutide": {
            showInPlans: true,
            label: "Oral Semaglutide",
            shortLabel: "Oral Semaglutide",
            heroImage: "/hero/tirzepatide.png",
            price: 129,
            unit: "/mo",
            inStock: true,
            ratingLabel: "Excellent",
            trustpilot: "5",
            bullets: [
                { icon: "Truck", text: "Fast approval, fast shipping" },
                { icon: "BadgeDollarSign", text: "No membership fees. Convenient oral form." },
                { icon: "SmilePlus", text: "30-day risk-free. Love it or your money back." },
                { icon: "Pills", text: "Easy-to-take oral medication" },
            ],
            description:
                "Oral Semaglutide provides the same weight loss benefits in a convenient pill form, perfect for those who prefer not to use injections.",
            ctas: {
                primary: { label: "Get started in 5 minutes", href: "/getstarted" },
                secondary: { label: "Book a free consultation", href: "/consult" },
            },
            howItWorks: {
                heading: "How Does Oral Semaglutide Work?",
                intro: "Oral Semaglutide delivers the same GLP-1 benefits through a convenient pill format.",
            },
            benefits: {
                leftTiles: [
                    { type: "image", src: "/hero/dynamic-safe.jpg", alt: "Dynamic tile" }
                ],
                rightCards: [
                    { icon: "Apple", title: "Appetite Control", body: "Reduces hunger and cravings naturally." },
                    { icon: "Droplets", title: "Blood Sugar Balance", body: "Helps maintain stable glucose levels." },
                    { icon: "Flame", title: "Metabolic Boost", body: "Enhances your body's energy efficiency." },
                    { icon: "Gauge", title: "Easy Compliance", body: "Simple pill format for better adherence." },
                ],
            },
        },
    },
};

// Helpers
export function getProduct(categorySlug, productSlug) {
    const cat = PRODUCT_CATALOG[slugify(categorySlug)];
    if (!cat) return null;
    return cat[slugify(productSlug)] || null;
}

// Helper function to get plan items for WeightLossPlans component
export function getPlanItems() {
    const weightLossProducts = PRODUCT_CATALOG["weight-loss"];
    if (!weightLossProducts) return [];
    
    // Map product data to plan format
    const planMapping = {
        "semaglutide": {
            name: "Compounded Semaglutide",
            img: "/hero/newsemaglutide.png",
            imgAlt: "Somi Compounded Semaglutide vial",
            secondaryHref: "/underdevelopmentmainpage/weight-loss/semaglutide"
        },
        "tirzepatide": {
            name: "Compounded Tirzepatide", 
            img: "/hero/newtirzepatide.png",
            imgAlt: "Somi Compounded Tirzepatide vial",
            secondaryHref: "/underdevelopmentmainpage/weight-loss/tirzepatide"
        },
        "oral-semaglutide": {
            name: "Oral Semaglutide",
            img: "/hero/newsemaglutide.png", // Using semaglutide image for now
            imgAlt: "Somi Oral Semaglutide",
            secondaryHref: "/underdevelopmentmainpage/weight-loss/oral-semaglutide"
        }
    };
    
    return Object.entries(weightLossProducts)
        .filter(([key, product]) => product.showInPlans)
        .map(([key, product]) => {
            const mapping = planMapping[key];
            return {
                name: mapping.name,
                img: mapping.img,
                imgAlt: mapping.imgAlt,
                priceLabel: "Starting At",
                currency: "$",
                price: product.price,
                per: product.unit,
                primary: { label: "Get Started", href: "/getstarted" },
                secondary: { label: "Learn More", href: mapping.secondaryHref },
            };
        });
}
