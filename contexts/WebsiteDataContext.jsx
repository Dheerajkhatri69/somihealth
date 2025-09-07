'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const WebsiteDataContext = createContext();

export function WebsiteDataProvider({ children }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch menus and products in parallel
      const [menusResponse, productsResponse] = await Promise.all([
        fetch('/api/menus', { cache: 'no-store' }),
        fetch('/api/products', { cache: 'no-store' })
      ]);

      if (!menusResponse.ok) {
        throw new Error(`Menus API error: ${menusResponse.status}`);
      }

      if (!productsResponse.ok) {
        throw new Error(`Products API error: ${productsResponse.status}`);
      }

      const [menusResult, productsResult] = await Promise.all([
        menusResponse.json(),
        productsResponse.json()
      ]);
      
      if (!menusResult.success) {
        throw new Error(menusResult.message || 'Failed to fetch menus');
      }

      if (!productsResult.success) {
        throw new Error(productsResult.message || 'Failed to fetch products');
      }

      // Transform the data to match the expected structure
      const responseData = {
        menus: menusResult.result,
        products: productsResult.result,
        navbarItems: menusResult.result.filter(menu => menu.showInNavbar)
      };

      setData(responseData);
    } catch (err) {
      console.error('Error fetching website data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh data function
  const refreshData = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Get menu by slug
  const getMenuBySlug = useCallback((slug) => {
    if (!data?.menus) return null;
    return data.menus.find(menu => menu.slug === slug) || null;
  }, [data]);

  // Get product by category and slug
  const getProduct = useCallback((category, slug) => {
    if (!data?.products?.[category]) return null;
    return data.products[category][slug] || null;
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
