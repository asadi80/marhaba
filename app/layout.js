import { Geist, Geist_Mono, Cairo, Tajawal } from "next/font/google";
import ClientLayout from './ClientLayout';
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

// ✅ Metadata can be exported here because this is a Server Component
export const metadata = {
  title: "Marhaba",
  description: "Find your next place",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} ${tajawal.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}