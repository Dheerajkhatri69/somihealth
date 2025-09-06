// lib/api-utils.js
// Updated utility functions that use the new API endpoints

// Helper function to get all menus from API
export async function getMenusFromAPI() {
  try {
    const response = await fetch('/api/menus');
    const data = await response.json();
    
    if (data.success) {
      return data.result;
    } else {
      console.error('Failed to fetch menus:', data.message);
      return {};
    }
  } catch (error) {
    console.error('Error fetching menus:', error);
    return {};
  }
}

// Helper function to get menu by slug from API
export async function getMenuBySlugFromAPI(slug) {
  try {
    const response = await fetch(`/api/menus/${slug}`);
    const data = await response.json();
    
    if (data.success) {
      return data.result;
    } else {
      console.error('Failed to fetch menu:', data.message);
      return null;
    }
  } catch (error) {
    console.error('Error fetching menu:', error);
    return null;
  }
}

// Helper function to get all products from API
export async function getProductsFromAPI(category = null, showInPlans = null) {
  try {
    let url = '/api/products';
    const params = new URLSearchParams();
    
    if (category) params.append('category', category);
    if (showInPlans !== null) params.append('showInPlans', showInPlans);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.success) {
      return data.result;
    } else {
      console.error('Failed to fetch products:', data.message);
      return {};
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    return {};
  }
}

// Helper function to get product by category and slug from API
export async function getProductFromAPI(category, slug) {
  try {
    const response = await fetch(`/api/products/${category}/${slug}`);
    const data = await response.json();
    
    if (data.success) {
      return data.result;
    } else {
      console.error('Failed to fetch product:', data.message);
      return null;
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Helper function to get plan items for WeightLossPlans component
export async function getPlanItemsFromAPI() {
  try {
    const products = await getProductsFromAPI('weight-loss', true);
    const weightLossProducts = products['weight-loss'] || {};
    
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
  } catch (error) {
    console.error('Error getting plan items:', error);
    return [];
  }
}

// Helper function to get grid items for CategoriesGrid
export async function getGridItemsFromAPI() {
  try {
    const menus = await getMenusFromAPI();
    
    // Map specific images for the grid display
    const gridImageMap = {
      "Weight Loss": "/hero/1.jpg",
      "Longevity": "/hero/2.png",
      "Sexual Health": "/hero/3.png",
      "Skin+Hair": "/hero/4.jpg",
      "General Health": "/hero/3.png"
    };

    return Object.entries(menus).map(([key, menu]) => ({
      title: key,
      img: gridImageMap[key] || menu.cta?.img, // Use grid image if available, fallback to CTA image
      href: menu.discover.href,
    }));
  } catch (error) {
    console.error('Error getting grid items:', error);
    return [];
  }
}

// Helper function to get only navbar menu items
export async function getNavbarItemsFromAPI() {
  try {
    const menus = await getMenusFromAPI();
    
    return Object.entries(menus)
      .filter(([key, menu]) => menu.showInNavbar)
      .map(([key, menu]) => ({ key, menu }));
  } catch (error) {
    console.error('Error getting navbar items:', error);
    return [];
  }
}

// Fallback to hardcoded data if API fails
export function getFallbackMenus() {
  return {
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
    }
  };
}

export function getFallbackProducts() {
  return {
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
        description: "Our compounded Semaglutide is a personalized formulation of GLP-1, crafted to fit your lifestyle and accelerate your weight loss journey.",
        ctas: {
          primary: { label: "Get started in 5 minutes", href: "/getstarted" },
          secondary: { label: "Book a free consultation", href: "/consult" },
        }
      }
    }
  };
}
