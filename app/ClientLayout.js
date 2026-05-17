// In your layout or components
'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  
  useEffect(() => {
    // Only runs on client, after mount
    import('@/lib/analytics').then(({ trackPageView }) => {
      if (pathname) {
        trackPageView(pathname);
      }
    });
  }, [pathname]);
  
  return <>{children}</>;
}