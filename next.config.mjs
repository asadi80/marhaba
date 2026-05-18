/** @type {import('next').NextConfig} */
import withPWA from '@ducanh2912/next-pwa';

const nextConfig = {
  reactStrictMode: true,
};

export default withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  // Optional: cache your API routes
  cacheStartUrl: true,
  dynamicStartUrl: true,
})(nextConfig);