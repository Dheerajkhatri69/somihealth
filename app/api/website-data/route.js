import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Menu from '@/lib/model/menu';
import Product from '@/lib/model/product';

// Cache for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let cache = {
  data: null,
  timestamp: 0
};

export async function GET(request) {
  try {
    await connectMongoDB();

    // Get URL parameters to check for cache busting
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('force') === 'true' || searchParams.get('t');

    // Check if we have valid cached data (skip cache if force refresh)
    const now = Date.now();
    if (!forceRefresh && cache.data && (now - cache.timestamp) < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        result: cache.data,
        cached: true
      }, {
        headers: {
          'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=60',
          'CDN-Cache-Control': 'max-age=300',
          'Vercel-CDN-Cache-Control': 'max-age=300'
        }
      });
    }

    // Fetch menus with proper sorting
    const menus = await Menu.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    // Fetch all products grouped by category
    const products = await Product.find({ isActive: true })
      .sort({ category: 1, name: 1 })
      .lean();

    // Transform menus data
    const transformedMenus = menus.map(menu => ({
      _id: menu._id,
      name: menu.name,
      slug: menu.slug,
      showInNavbar: menu.showInNavbar,
      type: menu.type,
      discover: menu.discover || { label: '', href: '' },
      treatments: menu.treatments || [],
      categories: menu.categories || [],
      cta: menu.cta || { title: '', button: { label: 'Get Started', href: '/getstarted' }, img: '' },
      mainPanelImg: menu.mainPanelImg || '',
      sortOrder: menu.sortOrder || 0
    }));

    // Group products by category
    const productsByCategory = {};
    products.forEach(product => {
      const category = product.category;
      if (!productsByCategory[category]) {
        productsByCategory[category] = [];
      }
      productsByCategory[category].push({
        slug: product.slug,
        label: product.label,
        shortLabel: product.shortLabel,
        heroImage: product.heroImage,
        price: product.price,
        unit: product.unit,
        inStock: product.inStock,
        ratingLabel: product.ratingLabel,
        trustpilot: product.trustpilot,
        bullets: product.bullets || [],
        description: product.description,
        ctas: product.ctas || { primary: { label: 'Get Started', href: '/getstarted' }, secondary: { label: 'Learn More', href: '#' } },
        howItWorks: product.howItWorks || {},
        benefits: product.benefits || {},
        showInPlans: product.showInPlans || false,
        category: product.category
      });
    });

    // Create the response data
    const responseData = {
      menus: transformedMenus,
      products: productsByCategory,
      navbarItems: transformedMenus.filter(menu => menu.showInNavbar)
    };

    // Update cache
    cache.data = responseData;
    cache.timestamp = now;

    return NextResponse.json({
      success: true,
      result: responseData,
      cached: false
    }, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=60',
        'CDN-Cache-Control': 'max-age=300',
        'Vercel-CDN-Cache-Control': 'max-age=300'
      }
    });

  } catch (error) {
    console.error('Website Data API Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message
    }, { status: 500 });
  }
}
