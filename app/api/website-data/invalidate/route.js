import { NextResponse } from 'next/server';

// This endpoint can be called to invalidate the website-data cache
// Useful for triggering cache refresh after dashboard updates
export async function POST() {
  try {
    // In a real implementation, you might want to:
    // 1. Store cache invalidation requests in a database
    // 2. Use a message queue or webhook system
    // 3. Implement proper authentication
    
    // For now, we'll return a success response
    // The actual cache invalidation will happen on the next request
    // due to the 5-minute cache duration
    
    return NextResponse.json({
      success: true,
      message: 'Cache invalidation requested. Changes will be visible within 5 minutes.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache invalidation error:', error);
    return NextResponse.json({
      success: false,
      message: error.message
    }, { status: 500 });
  }
}

// GET endpoint to check cache status
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Cache invalidation endpoint is active',
    timestamp: new Date().toISOString()
  });
}
