'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Geist, Geist_Mono, Cairo, Tajawal, Almara } from "next/font/google";
import { trackPageView } from '@/lib/analytics';

import "./globals.css";

const cairo = Cairo({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cairo',
});

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-tajawal',
});


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata = {
  title: "Marhaba",
  description: "Find your next place",
};

export default function RootLayout({ children }) {
   const pathname = usePathname();
  
  useEffect(() => {
    // Track all page views automatically
    trackPageView(pathname);
  }, [pathname]);
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
    
      
         {children}
      
       </body>
    </html>
  );
}
