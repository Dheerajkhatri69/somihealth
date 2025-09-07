'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const WebsiteDataContext = createContext();

export function WebsiteDataProvider({ children }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(0);

  // Cache duration: 5 minutes
  const CACHE_DURATION = 5 * 60 * 1000;

  const fetchData = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    
    // Check if we have valid cached data and not forcing refresh
    if (!forceRefresh && data && (now - lastFetch) < CACHE_DURATION) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Add timestamp to force cache busting on Netlify
      const timestamp = Date.now();
      const response = await fetch(`/api/website-data?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch data');
      }

      setData(result.result);
      setLastFetch(now);
    } catch (err) {
      console.error('Error fetching website data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [data, lastFetch, CACHE_DURATION]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Refresh data function
  const refreshData = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  // Clear cache and force refresh (useful after dashboard updates)
  const clearCacheAndRefresh = useCallback(() => {
    setData(null);
    setLastFetch(0);
    fetchData(true);
  }, [fetchData]);

  // Get menu by slug
  const getMenuBySlug = useCallback((slug) => {
    if (!data?.menus) return null;
    return data.menus.find(menu => menu.slug === slug) || null;
  }, [data]);

  // Get product by category and slug
  const getProduct = useCallback((category, slug) => {
    if (!data?.products?.[category]) return null;
    return data.products[category].find(product => product.slug === slug) || null;
  }, [data]);

  // Get navbar items
  const getNavbarItems = useCallback(() => {
    if (!data?.navbarItems) return [];
    return data.navbarItems.map(menu => ({ key: menu.slug, menu }));
  }, [data]);

  // Get grid items for homepage
  const getGridItems = useCallback(() => {
    if (!data?.menus) return [];
    return data.menus.map(menu => ({
      title: menu.name,
      img: menu.mainPanelImg || menu.cta?.img || '/hero/default.jpg',
      href: menu.discover?.href || `/${menu.slug}`
    }));
  }, [data]);

  const value = {
    data,
    isLoading,
    error,
    refreshData,
    clearCacheAndRefresh,
    getMenuBySlug,
    getProduct,
    getNavbarItems,
    getGridItems
  };

  return (
    <WebsiteDataContext.Provider value={value}>
      {children}
    </WebsiteDataContext.Provider>
  );
}

export function useWebsiteData() {
  const context = useContext(WebsiteDataContext);
  if (!context) {
    throw new Error('useWebsiteData must be used within a WebsiteDataProvider');
  }
  return context;
}
