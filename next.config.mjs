import withSerwist from "@serwist/next";

const withPWA = withSerwist({
  swSrc: "app/sw.js",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
  experimental: {
    serverActions: {
      bodySizeLimit: '15mb',
    },
  },
};

export default withPWA(nextConfig);