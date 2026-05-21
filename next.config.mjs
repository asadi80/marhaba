/** @type {import('next').NextConfig} */
import withPWA from '@ducanh2912/next-pwa';

const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
};

export default withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  cacheStartUrl: true,
  dynamicStartUrl: true,
  // Add these to reduce console logs
  workboxOptions: {
    // Disable logging in development
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    // Optional: Custom cache strategies
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts',
          expiration: {
            maxEntries: 30,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          },
        },
      },
      {
        urlPattern: /^https:\/\/.*\.tile\.openstreetmap\.org\/.*/i,
        handler: 'NetworkOnly', // Keep maps fresh
        options: {
          cacheName: 'osm-tiles',
        },
      },
      {
        urlPattern: /^\/api\/.*/i,
        handler: 'NetworkOnly', // Don't cache API responses
        options: {
          cacheName: 'api-responses',
        },
      },
    ],
  },
  // Suppress workbox logs in development
  ...(process.env.NODE_ENV === 'development' && {
    onSuccess: undefined,
    onRegister: undefined,
  }),
})(nextConfig);