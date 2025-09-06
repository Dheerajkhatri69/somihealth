// scripts/seed-database.js
// Script to seed the database with initial menu and product data

import mongoose from 'mongoose';
import Menu from '../lib/model/menu.js';
import Product from '../lib/model/product.js';
import { connectionSrt } from '../lib/db.js';

// Sample menu data
const sampleMenus = [
  {
    name: "Weight Loss",
    slug: "weight-loss",
    showInNavbar: true,
    type: "simple",
    discover: { 
      label: "Weight Loss", 
      href: "/underdevelopmentmainpage/weight-loss" 
    },
    treatments: [
      { 
        label: "Compounded Semaglutide", 
        href: "/underdevelopmentmainpage/weight-loss/semaglutide", 
        img: "/hero/semaglutide.png" 
      },
      { 
        label: "Compounded Tirzepatide", 
        href: "/underdevelopmentmainpage/weight-loss/tirzepatide", 
        img: "/hero/tirzepatide.png" 
      },
      { 
        label: "Oral Semaglutide", 
        href: "/underdevelopmentmainpage/weight-loss/oral-semaglutide", 
        img: "/hero/tirzepatide.png", 
        badge: "NEW" 
      }
    ],
    cta: {
      title: "Personalized\nWeight Loss",
      button: { label: "Get Started", href: "/getstarted" },
      img: "/hero/getstarted1.png"
    },
    sortOrder: 1
  },
  {
    name: "Longevity",
    slug: "longevity",
    showInNavbar: true,
    type: "simple",
    discover: { 
      label: "Longevity", 
      href: "/underdevelopmentmainpage/longevity" 
    },
    treatments: [
      { 
        label: "B-12 Shots", 
        href: "/underdevelopmentmainpage/energy-mood/b12", 
        img: "/hero/tirzepatide.png" 
      },
      { 
        label: "Vitamin IV", 
        href: "/underdevelopmentmainpage/energy-mood/iv", 
        img: "/hero/tirzepatide.png" 
      },
      { 
        label: "Stress Support", 
        href: "/underdevelopmentmainpage/energy-mood/stress", 
        img: "/hero/tirzepatide.png" 
      }
    ],
    cta: {
      title: "Boost Energy\n& Mood",
      button: { label: "Get Started", href: "/getstarted" },
      img: "/hero/second1.png"
    },
    sortOrder: 2
  },
  {
    name: "Sexual Health",
    slug: "sexual-health",
    showInNavbar: true,
    type: "simple",
    discover: { 
      label: "Sexual Health", 
      href: "/underdevelopmentmainpage/sexual-health" 
    },
    treatments: [
      { 
        label: "Hormone Support", 
        href: "/underdevelopmentmainpage/strength-vitality/hormone", 
        img: "/hero/tirzepatide.png" 
      },
      { 
        label: "Muscle Recovery", 
        href: "/underdevelopmentmainpage/strength-vitality/recovery", 
        img: "/hero/tirzepatide.png" 
      },
      { 
        label: "Performance Pack", 
        href: "/underdevelopmentmainpage/strength-vitality/performance", 
        img: "/hero/tirzepatide.png" 
      }
    ],
    cta: {
      title: "Stronger.\nFitter.",
      button: { label: "Get Started", href: "/getstarted" },
      img: "/hero/thired1.png"
    },
    sortOrder: 3
  },
  {
    name: "Skin+Hair",
    slug: "skin-hair",
    showInNavbar: true,
    type: "simple",
    discover: { 
      label: "Skin+Hair", 
      href: "/underdevelopmentmainpage/skin-hair" 
    },
    treatments: [
      { 
        label: "Hormone Support", 
        href: "/underdevelopmentmainpage/strength-vitality/hormone", 
        img: "/hero/tirzepatide.png" 
      },
      { 
        label: "Muscle Recovery", 
        href: "/underdevelopmentmainpage/strength-vitality/recovery", 
        img: "/hero/tirzepatide.png" 
      },
      { 
        label: "Performance Pack", 
        href: "/underdevelopmentmainpage/strength-vitality/performance", 
        img: "/hero/tirzepatide.png" 
      }
    ],
    cta: {
      title: "Stronger.\nFitter.",
      button: { label: "Get Started", href: "/getstarted" },
      img: "/hero/4.jpg"
    },
    sortOrder: 4
  },
  {
    name: "General Health",
    slug: "general-health",
    showInNavbar: true,
    type: "categorized",
    discover: { 
      label: "General Health", 
      href: "/underdevelopmentmainpage/general-health" 
    },
    categories: [
      {
        title: "Direct Primary Care",
        items: [
          { label: "High Blood Pressure", href: "/underdevelopmentmainpage/general-health/high-blood-pressure" },
          { label: "Diabetes", href: "/underdevelopmentmainpage/general-health/diabetes" },
          { label: "High Cholesterol", href: "/underdevelopmentmainpage/general-health/high-cholesterol" },
          { label: "Hypothyroidism", href: "/underdevelopmentmainpage/general-health/hypothyroidism" },
          { label: "Acid Reflux", href: "/underdevelopmentmainpage/general-health/acid-reflux" },
          { label: "Hot Flashes", href: "/underdevelopmentmainpage/general-health/hot-flashes" }
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
          { label: "Paxlovid", href: "/underdevelopmentmainpage/general-health/paxlovid" }
        ]
      },
      {
        title: "Medication Refill",
        items: [
          { label: "Short Bridge Refill", href: "/underdevelopmentmainpage/general-health/short-bridge-refill" },
          { label: "Emergency Rx Refill", href: "/refills", isLink: true }
        ]
      }
    ],
    cta: {
      title: "Comprehensive\nHealthcare",
      button: { label: "Get Started", href: "/getstarted" },
      img: "/hero/3.png"
    },
    sortOrder: 5
  }
];

// Sample product data
const sampleProducts = [
  {
    category: "weight-loss",
    slug: "semaglutide",
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
      { icon: "Syringe", text: "Full home injection kit included" }
    ],
    description: "Our compounded Semaglutide is a personalized formulation of GLP-1, crafted to fit your lifestyle and accelerate your weight loss journey.",
    ctas: {
      primary: { label: "Get started in 5 minutes", href: "/getstarted" },
      secondary: { label: "Book a free consultation", href: "/consult" }
    },
    howItWorks: {
      heading: "How Does Compounded Semaglutide Help You Lose Weight?",
      intro: "Compounded Semaglutide mimics GLP-1, a natural hormone that helps regulate appetite and blood sugar."
    },
    benefits: {
      leftTiles: [
        { type: "image", src: "/hero/dynamic-safe.jpg", alt: "Dynamic tile" }
      ],
      rightCards: [
        { icon: "Apple", title: "Reduces Appetite", body: "Helps you eat less and control cravings." },
        { icon: "Droplets", title: "Regulates Blood Sugar", body: "Prevents spikes and crashes for steady energy." },
        { icon: "Flame", title: "Boosts Metabolic Efficiency", body: "Enhances how your body uses energy." },
        { icon: "Gauge", title: "Improves Portion Control", body: "Supports long-term weight management." }
      ]
    },
    sortOrder: 1
  },
  {
    category: "weight-loss",
    slug: "tirzepatide",
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
      { icon: "Syringe", text: "Home injection kit included" }
    ],
    description: "Compounded Tirzepatide is a dual-agonist that supports appetite control and glucose management for advanced results.",
    ctas: {
      primary: { label: "Get started in 5 minutes", href: "/getstarted" },
      secondary: { label: "Book a free consultation", href: "/consult" }
    },
    howItWorks: {
      heading: "How Does Compounded Tirzepatide Support Weight Loss?",
      intro: "A dual GIP/GLP-1 agonist that targets appetite and glucose regulation together."
    },
    benefits: {
      leftTiles: [
        { type: "image", src: "/hero/dynamic-safe.jpg", alt: "Dynamic tile" }
      ],
      rightCards: [
        { icon: "Apple", title: "Controls Cravings", body: "Feel full sooner and longer." },
        { icon: "Droplets", title: "Balances Glucose", body: "Supports stable energy and mood." },
        { icon: "Flame", title: "Metabolic Support", body: "Optimizes fuel usage." },
        { icon: "Gauge", title: "Portion Control", body: "Easier adherence to plans." }
      ]
    },
    sortOrder: 2
  },
  {
    category: "weight-loss",
    slug: "oral-semaglutide",
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
      { icon: "Pills", text: "Easy-to-take oral medication" }
    ],
    description: "Oral Semaglutide provides the same weight loss benefits in a convenient pill form, perfect for those who prefer not to use injections.",
    ctas: {
      primary: { label: "Get started in 5 minutes", href: "/getstarted" },
      secondary: { label: "Book a free consultation", href: "/consult" }
    },
    howItWorks: {
      heading: "How Does Oral Semaglutide Work?",
      intro: "Oral Semaglutide delivers the same GLP-1 benefits through a convenient pill format."
    },
    benefits: {
      leftTiles: [
        { type: "image", src: "/hero/dynamic-safe.jpg", alt: "Dynamic tile" }
      ],
      rightCards: [
        { icon: "Apple", title: "Appetite Control", body: "Reduces hunger and cravings naturally." },
        { icon: "Droplets", title: "Blood Sugar Balance", body: "Helps maintain stable glucose levels." },
        { icon: "Flame", title: "Metabolic Boost", body: "Enhances your body's energy efficiency." },
        { icon: "Gauge", title: "Easy Compliance", body: "Simple pill format for better adherence." }
      ]
    },
    sortOrder: 3
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(connectionSrt);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Menu.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');

    // Insert menus
    const insertedMenus = await Menu.insertMany(sampleMenus);
    console.log(`Inserted ${insertedMenus.length} menus`);

    // Insert products
    const insertedProducts = await Product.insertMany(sampleProducts);
    console.log(`Inserted ${insertedProducts.length} products`);

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
seedDatabase();
