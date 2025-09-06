import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Menu from '@/lib/model/menu';
import { connectionSrt } from '@/lib/db';

// Connect to MongoDB
async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(connectionSrt);
  }
}

// GET: Fetch all menus
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // If id is provided, return a single menu document as-is
    if (id) {
      const menu = await Menu.findById(id).lean();
      if (!menu) {
        return NextResponse.json({ success: false, message: 'Menu not found' }, { status: 404 });
      }
      return NextResponse.json({ result: menu, success: true });
    }

    const menus = await Menu.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    // Return as array to preserve sort order
    const transformedMenus = menus.map(menu => ({
      _id: menu._id,
      name: menu.name,
      slug: menu.slug,
      showInNavbar: menu.showInNavbar,
      discover: menu.discover,
      treatments: menu.treatments || [],
      categories: menu.categories || [],
      cta: menu.cta,
      mainPanelImg: menu.mainPanelImg,
      type: menu.type,
      sortOrder: menu.sortOrder,
    }));

    return NextResponse.json({ 
      result: transformedMenus, 
      success: true 
    });
  } catch (error) {
    console.error('GET Menus Error:', error);
    return NextResponse.json({ 
      result: 'error', 
      message: error.message, 
      success: false 
    }, { status: 500 });
  }
}

// POST: Create new menu
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json({ 
        success: false, 
        message: 'Name is required' 
      }, { status: 400 });
    }

    // For simple menus, discover fields are required
    if (body.type !== 'categorized' && (!body.discover || !body.discover.label || !body.discover.href)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Discover label and href are required for simple menus' 
      }, { status: 400 });
    }

    const newMenu = new Menu(body);
    const result = await newMenu.save();

    return NextResponse.json({ 
      result, 
      success: true 
    }, { status: 201 });
  } catch (error) {
    console.error('POST Menu Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}

// PUT: Update menu
export async function PUT(request) {
  try {
    await connectDB();

    const body = await request.json();

    // Support two shapes:
    // 1) { id, ...update }
    // 2) { selector: { _id | slug | name }, update: { ... } }

    if (body && body.selector && body.update) {
      const selector = {};
      if (body.selector._id) selector._id = body.selector._id;
      if (body.selector.slug) selector.slug = body.selector.slug;
      if (body.selector.name) selector.name = body.selector.name;

      if (Object.keys(selector).length === 0) {
        return NextResponse.json({ success: false, message: 'Invalid selector' }, { status: 400 });
      }

      const result = await Menu.findOneAndUpdate(
        selector,
        body.update,
        { new: true, runValidators: true }
      );

      if (!result) {
        return NextResponse.json({ success: false, message: 'Menu not found' }, { status: 404 });
      }
      return NextResponse.json({ result, success: true });
    }

    const { id, ...updateData } = body || {};
    if (!id) {
      return NextResponse.json({ success: false, message: 'Menu ID is required' }, { status: 400 });
    }

    const result = await Menu.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!result) {
      return NextResponse.json({ success: false, message: 'Menu not found' }, { status: 404 });
    }
    return NextResponse.json({ result, success: true });
  } catch (error) {
    console.error('PUT Menu Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE: Delete menu (soft delete)
export async function DELETE(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Prefer id query param when present
    if (id) {
      const result = await Menu.findByIdAndUpdate(id, { isActive: false }, { new: true });
      if (!result) {
        return NextResponse.json({ success: false, message: 'Menu not found' }, { status: 404 });
      }
      return NextResponse.json({ result, success: true });
    }

    // Also support JSON body: { selector }
    let selectorBody = null;
    try {
      selectorBody = await request.json();
    } catch {}

    const selector = selectorBody?.selector || null;
    if (!selector) {
      return NextResponse.json({ success: false, message: 'Menu ID or selector is required' }, { status: 400 });
    }

    const query = {};
    if (selector._id) query._id = selector._id;
    if (selector.slug) query.slug = selector.slug;
    if (selector.name) query.name = selector.name;

    if (Object.keys(query).length === 0) {
      return NextResponse.json({ success: false, message: 'Invalid selector' }, { status: 400 });
    }

    const result = await Menu.findOneAndUpdate(query, { isActive: false }, { new: true });
    if (!result) {
      return NextResponse.json({ success: false, message: 'Menu not found' }, { status: 404 });
    }
    return NextResponse.json({ result, success: true });
  } catch (error) {
    console.error('DELETE Menu Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PATCH: Batch update sort orders (reorder)
export async function PATCH(request) {
  try {
    await connectDB();

    const body = await request.json();
    const updates = Array.isArray(body?.updates) ? body.updates : null;
    if (!updates || updates.length === 0) {
      return NextResponse.json({ success: false, message: 'No updates provided' }, { status: 400 });
    }

    // Build bulk operations supporting _id or slug or name selectors
    const ops = updates.map((u) => {
      const updateDoc = { $set: { sortOrder: Number(u.sortOrder) || 0 } };
      if (u._id) return { updateOne: { filter: { _id: u._id }, update: updateDoc } };
      if (u.slug) return { updateOne: { filter: { slug: u.slug }, update: updateDoc } };
      if (u.name) return { updateOne: { filter: { name: u.name }, update: updateDoc } };
      return null;
    }).filter(Boolean);

    if (ops.length === 0) {
      return NextResponse.json({ success: false, message: 'Invalid updates' }, { status: 400 });
    }

    await Menu.bulkWrite(ops);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PATCH Menus Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
