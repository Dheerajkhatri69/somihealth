'use client';

import { WebsiteDataProvider } from '@/contexts/WebsiteDataContext';

export default function WebsiteDataProviderWrapper({ children }) {
  return (
    <WebsiteDataProvider>
      {children}
    </WebsiteDataProvider>
  );
}
