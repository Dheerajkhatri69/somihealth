// Utility functions for cache management

/**
 * Invalidate website data cache by calling the invalidation endpoint
 * This can be called from your dashboard after updating products or menus
 */
export async function invalidateWebsiteDataCache() {
  try {
    const response = await fetch('/api/website-data/invalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Cache invalidation requested:', result.message);
      return true;
    } else {
      console.error('Cache invalidation failed:', result.message);
      return false;
    }
  } catch (error) {
    console.error('Error calling cache invalidation:', error);
    return false;
  }
}

/**
 * Force refresh website data by calling the API with cache busting
 * This bypasses both client and server cache
 */
export async function forceRefreshWebsiteData() {
  try {
    const timestamp = Date.now();
    const response = await fetch(`/api/website-data?force=true&t=${timestamp}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Website data force refreshed');
      return result.result;
    } else {
      console.error('Force refresh failed:', result.message);
      return null;
    }
  } catch (error) {
    console.error('Error force refreshing website data:', error);
    return null;
  }
}
