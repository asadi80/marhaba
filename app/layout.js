// app/layout.jsx
import { Cairo, Tajawal, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const ICON_VERSION = "3"; // ← keep in sync with manifest.js

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
  manifest: "/manifest.webmanifest",   
  themeColor: "#1a1a2e",               
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Marhaba",
  },
  icons: {
    apple: `/icon-192-v3.png?v=${ICON_VERSION}`,  
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} ${tajawal.variable} h-full antialiased`}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Marhaba" />
        <meta name="theme-color" content="#1a1a2e" />
        {/* ✅ Versioned apple touch icon — forces iOS to re-fetch on version bump */}
        <link rel="apple-touch-icon" href={`/icon-192-v3.png?v=${ICON_VERSION}`} />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}