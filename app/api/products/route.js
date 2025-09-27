import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Product from '@/lib/model/product';
import { connectionSrt } from '@/lib/db';

// Connect to MongoDB
async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(connectionSrt);
  }
}

// Normalize text into a URL-safe slug
function slugify(text = '') {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // replace any non-alnum run with '-'
    .replace(/^-+|-+$/g, '')     // trim leading/trailing '-'
    .replace(/-+/g, '-');        // collapse multiple '-'
}

function isValidObjectId(v) {
  return /^[a-f0-9]{24}$/i.test(String(v || ''));
}

// Transform DB products to grouped map { category: { slug: product } }
function groupProducts(products) {
  const grouped = {};
  products.forEach((p) => {
    const category = p.category;
    const slug = p.slug;
    if (!grouped[category]) grouped[category] = {};
    grouped[category][slug] = p;
  });
  return grouped;
}

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single fetch by id / composite / slug
    if (id) {
      let product = null;

      if (id.includes('::')) {
        const [category, slug] = id.split('::');
        product = await Product.findOne({ category, slug, isActive: true }).lean();
      } else if (isValidObjectId(id)) {
        product = await Product.findById(id).lean();
      } else {
        // Try by slug (first matching active product)
        product = await Product.findOne({ slug: id, isActive: true }).lean();
      }

      if (!product) {
        return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json({ result: product, success: true });
    }

    // List grouped by category -> slug
    const products = await Product.find({ isActive: true })
      .sort({ category: 1, sortOrder: 1, label: 1 })
      .lean();

    const grouped = groupProducts(products);
    return NextResponse.json({ result: grouped, success: true });
  } catch (error) {
    console.error('GET Products Error:', error);
    return NextResponse.json({ result: 'error', message: error.message, success: false }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    // Basic validation
    const required = [
      'category', 'slug', 'label', 'shortLabel', 'heroImage', 'price', 'unit', 'description',
      'productDetails', 'howItWorksSection'
    ];
    // Auto slug from label if slug is empty
    if (!body.slug && body.label) {
      body.slug = slugify(body.label);
    }
    const missing = required.filter((k) => body[k] === undefined || body[k] === null || body[k] === '');
    if (missing.length) {
      return NextResponse.json({ success: false, message: `Missing fields: ${missing.join(', ')}` }, { status: 400 });
    }

    const created = await Product.create(body);
    // Auto-sync to menu treatments
    await handleMenuTreatmentSync(null, created);
    return NextResponse.json({ result: created, success: true }, { status: 201 });
  } catch (error) {
    console.error('POST Product Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    const body = await request.json();

    // Support shapes:
    // 1) { id, ...update }
    // 2) { selector: { _id | category+slug | slug }, update: { ... } }

    let oldProduct = null;
    let result = null;

    if (body && body.selector && body.update) {
      const selector = {};
      if (body.selector._id) selector._id = body.selector._id;
      if (body.selector.category && body.selector.slug) {
        selector.category = body.selector.category;
        selector.slug = body.selector.slug;
      }
      if (body.selector.slug && !selector.category) selector.slug = body.selector.slug;

      if (Object.keys(selector).length === 0) {
        return NextResponse.json({ success: false, message: 'Invalid selector' }, { status: 400 });
      }

      // Get old product before update to check for category change
      oldProduct = await Product.findOne(selector).lean();
      // Auto slug from label if slug missing in update
      if ((!body.update.slug || body.update.slug === '') && body.update.label) {
        body.update.slug = slugify(body.update.label);
      }
      result = await Product.findOneAndUpdate(selector, body.update, { new: true, runValidators: true });
      if (!result) return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    } else {
      const { id, ...updateData } = body || {};
      if (!id) {
        return NextResponse.json({ success: false, message: 'Product id is required' }, { status: 400 });
      }

      // Get old product before update to check for category change
      if (typeof id === 'string' && id.includes('::')) {
        const [category, slug] = id.split('::');
        oldProduct = await Product.findOne({ category, slug }).lean();
        if ((!updateData.slug || updateData.slug === '') && updateData.label) {
          updateData.slug = slugify(updateData.label);
        }
        result = await Product.findOneAndUpdate({ category, slug }, updateData, { new: true, runValidators: true });
      } else if (isValidObjectId(id)) {
        oldProduct = await Product.findById(id).lean();
        if ((!updateData.slug || updateData.slug === '') && updateData.label) {
          updateData.slug = slugify(updateData.label);
        }
        result = await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
      } else {
        oldProduct = await Product.findOne({ slug: id }).lean();
        if ((!updateData.slug || updateData.slug === '') && updateData.label) {
          updateData.slug = slugify(updateData.label);
        }
        result = await Product.findOneAndUpdate({ slug: id }, updateData, { new: true, runValidators: true });
      }

      if (!result) return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    // Handle menu treatment sync with category change detection
    await handleMenuTreatmentSync(oldProduct, result);
    
    // If product slug changed, update treatment hrefs in all menus
    if (oldProduct && oldProduct.slug !== result.slug) {
      await updateTreatmentHrefsForProductSlugChange(oldProduct, result);
    }
    
    return NextResponse.json({ result, success: true });
  } catch (error) {
    console.error('PUT Product Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      let result = null;
      if (id.includes('::')) {
        const [category, slug] = id.split('::');
        result = await Product.findOneAndUpdate({ category, slug }, { isActive: false }, { new: true });
      } else if (isValidObjectId(id)) {
        result = await Product.findByIdAndUpdate(id, { isActive: false }, { new: true });
      } else {
        result = await Product.findOneAndUpdate({ slug: id }, { isActive: false }, { new: true });
      }
      if (!result) return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
      // Ensure removal from menu treatments when deleted via query param
      await removeProductFromMenuTreatments(result);
      return NextResponse.json({ result, success: true });
    }

    // Body selector support
    let selectorBody = null;
    try { selectorBody = await request.json(); } catch {}
    const selector = selectorBody?.selector || null;
    if (!selector) {
      return NextResponse.json({ success: false, message: 'Product id or selector is required' }, { status: 400 });
    }

    const query = {};
    if (selector._id) query._id = selector._id;
    if (selector.category && selector.slug) { query.category = selector.category; query.slug = selector.slug; }
    if (selector.slug && !query.category) query.slug = selector.slug;
    if (Object.keys(query).length === 0) {
      return NextResponse.json({ success: false, message: 'Invalid selector' }, { status: 400 });
    }

    const result = await Product.findOneAndUpdate(query, { isActive: false }, { new: true });
    if (!result) return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    
    // Remove from menu treatments when product is deleted
    await removeProductFromMenuTreatments(result);
    
    return NextResponse.json({ result, success: true });
  } catch (error) {
    console.error('DELETE Product Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// Handle menu treatment sync with category/slug change detection
async function handleMenuTreatmentSync(oldProduct, newProduct) {
  try {
    const Menu = (await import('@/lib/model/menu')).default;
    
    // If category or slug changed, remove the old entry first to avoid duplicates
    if (
      oldProduct &&
      (oldProduct.category !== newProduct.category || oldProduct.slug !== newProduct.slug)
    ) {
      await removeProductFromMenuTreatments(oldProduct);
    }
    
    // Add/update in new menu
    await syncProductToMenuTreatments(newProduct);
  } catch (error) {
    console.error('Error handling menu treatment sync:', error);
  }
}

// Remove product from menu treatments
async function removeProductFromMenuTreatments(product) {
  try {
    const Menu = (await import('@/lib/model/menu')).default;
    
    // Find menu by old category name (case-insensitive)
    const categoryName = product.category;
    const menu = await Menu.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${categoryName}$`, 'i') } },
        { slug: { $regex: new RegExp(`^${categoryName}$`, 'i') } }
      ],
      isActive: true
    });
    
    if (!menu) return; // No matching menu found
    
    // Create treatment href to find and remove
    const treatmentHref = `/underdevelopmentmainpage/${product.category}/${product.slug}`;
    
    // Remove treatment from menu treatments array
    const initialLength = menu.treatments.length;
    menu.treatments = menu.treatments.filter(t => t.href !== treatmentHref);
    
    // Only save if something was actually removed
    if (menu.treatments.length < initialLength) {
      await menu.save();
      console.log(`Removed treatment "${product.label}" from menu "${menu.name}"`);
    }
  } catch (error) {
    console.error('Error removing product from menu treatments:', error);
  }
}

// Auto-sync product to menu treatments
async function syncProductToMenuTreatments(product) {
  try {
    const Menu = (await import('@/lib/model/menu')).default;
    
    // Find menu by category name (case-insensitive)
    const categoryName = product.category;
    const menu = await Menu.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${categoryName}$`, 'i') } },
        { slug: { $regex: new RegExp(`^${categoryName}$`, 'i') } }
      ],
      isActive: true
    });
    
    if (!menu) return; // No matching menu found
    
    // Create treatment object
    const treatment = {
      label: product.label,
      href: `/underdevelopmentmainpage/${product.category}/${product.slug}`,
      img: product.heroImage,
      badge: product.trustpilot || ''
    };
    
    // Update menu treatments array
    const existingIndex = menu.treatments.findIndex(t => t.href === treatment.href);
    if (existingIndex >= 0) {
      // Update existing treatment
      menu.treatments[existingIndex] = treatment;
      console.log(`Updated treatment "${product.label}" in menu "${menu.name}"`);
    } else {
      // Add new treatment
      menu.treatments.push(treatment);
      console.log(`Added treatment "${product.label}" to menu "${menu.name}"`);
    }
    
    await menu.save();
  } catch (error) {
    console.error('Error syncing product to menu treatments:', error);
  }
}

// Update treatment hrefs when product slug changes
async function updateTreatmentHrefsForProductSlugChange(oldProduct, newProduct) {
  try {
    const Menu = (await import('@/lib/model/menu')).default;
    
    // Find all menus that might have treatments for this product
    const menus = await Menu.find({ isActive: true });
    
    for (const menu of menus) {
      let needsUpdate = false;
      
      // Update treatment hrefs that contain the old product slug
      menu.treatments = menu.treatments.map(treatment => {
        if (treatment.href && treatment.href.includes(`/${oldProduct.slug}`)) {
          needsUpdate = true;
          return {
            ...treatment,
            href: treatment.href.replace(`/${oldProduct.slug}`, `/${newProduct.slug}`)
          };
        }
        return treatment;
      });
      
      if (needsUpdate) {
        await menu.save();
        console.log(`Updated treatment hrefs in menu "${menu.name}" for product slug change from ${oldProduct.slug} to ${newProduct.slug}`);
      }
    }
  } catch (error) {
    console.error('Error updating treatment hrefs for product slug change:', error);
  }
}
