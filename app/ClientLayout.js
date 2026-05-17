'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { trackPageView } from '@/lib/analytics';

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  
  useEffect(() => {
    // Track all page views automatically
    if (pathname) {
      trackPageView(pathname);
    }
  }, [pathname]);
  
  return (
    <>
      {children}
    </>
  );
}