/** @type {import('next').NextConfig} */
import withSerwist from "@serwist/next";

const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
  experimental: {
    serverActions: {
      bodySizeLimit: '15mb',
    },
  },
};
const withPWA = withSerwist({
  swSrc: "app/sw.js",      // you write the SW
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});


export default withPWA({
  dest: 'public',
  reactStrictMode: true,
  register: true,
  skipWaiting: true,
  cacheStartUrl: true,
  dynamicStartUrl: true,
  workboxOptions: {
   
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts',
          expiration: {
            maxEntries: 30,
            maxAgeSeconds: 60 * 60 * 24 * 365,
          },
        },
      },
      {
        urlPattern: /^https:\/\/.*\.tile\.openstreetmap\.org\/.*/i,
        handler: 'NetworkOnly',
        options: {
          cacheName: 'osm-tiles',
        },
      },
      {
        urlPattern: /^\/api\/.*/i,
        handler: 'NetworkOnly',
        options: {
          cacheName: 'api-responses',
        },
      },
    ],
  },
  ...(process.env.NODE_ENV === 'development' && {
    onSuccess: undefined,
    onRegister: undefined,
  }),
})(nextConfig);