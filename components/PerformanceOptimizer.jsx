'use client';

import { useEffect, useState } from 'react';

// Preload critical images
export function ImagePreloader({ images = [] }) {
  useEffect(() => {
    images.forEach(src => {
      if (src) {
        const img = new Image();
        img.src = src;
      }
    });
  }, [images]);

  return null;
}

// Intersection Observer for lazy loading
export function useIntersectionObserver(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [ref, setRef] = useState(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        ...options
      }
    );

    observer.observe(ref);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return [setRef, isIntersecting];
}

// Debounced search hook
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Memory-efficient data processing
export function useDataProcessor(rawData, processor) {
  const [processedData, setProcessedData] = useState(null);

  useEffect(() => {
    if (!rawData) return;

    // Use requestIdleCallback for non-critical processing
    const processData = () => {
      const result = processor(rawData);
      setProcessedData(result);
    };

    if (window.requestIdleCallback) {
      window.requestIdleCallback(processData);
    } else {
      setTimeout(processData, 0);
    }
  }, [rawData, processor]);

  return processedData;
}

// Connection-aware loading
export function useConnectionAwareLoading() {
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  useEffect(() => {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      const isSlow = connection.effectiveType === 'slow-2g' || 
                     connection.effectiveType === '2g' ||
                     connection.effectiveType === '3g';

      setIsSlowConnection(isSlow);

      const handleChange = () => {
        const isSlow = connection.effectiveType === 'slow-2g' || 
                       connection.effectiveType === '2g' ||
                       connection.effectiveType === '3g';
        setIsSlowConnection(isSlow);
      };

      connection.addEventListener('change', handleChange);
      return () => connection.removeEventListener('change', handleChange);
    }
  }, []);

  return isSlowConnection;
}
