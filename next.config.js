// next.config.js
import withPWA from '@ducanh2912/next-pwa';

const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
  experimental: {
    serverActions: {
      bodySizeLimit: '15mb',
    },
  },
};

export default withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest\.json$/],
  register: true,
  skipWaiting: true,         
  cacheStartUrl: true,
  dynamicStartUrl: true,
  workboxOptions: {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts',
          expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
        },
      },
      {
        urlPattern: /^https:\/\/.*\.tile\.openstreetmap\.org\/.*/i,
        handler: 'NetworkOnly',
        options: { cacheName: 'osm-tiles' },
      },
      {
        urlPattern: /^\/api\/.*/i,
        handler: 'NetworkOnly',
        options: { cacheName: 'api-responses' },
      },
      // ✅ Add this — ensures icon files are never served stale from SW cache
      {
        urlPattern: /\/icon-.*\.png(\?.*)?$/i,
        handler: 'NetworkOnly',
        options: {
          cacheName: 'app-icons',
          expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 },
        },
      },
    ],
  },
})(nextConfig);