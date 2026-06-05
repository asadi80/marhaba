import withSerwist from "@serwist/next";

const withPWA = withSerwist({
  swSrc: "app/sw.js",
  swDest: "public/sw.js",
  injectionPoint: "self.__SW_MANIFEST",  // ← add this
  disable: process.env.NODE_ENV === "development",
});

export default withPWA({
  reactStrictMode: true,
  turbopack: {},
  experimental: {
    serverActions: {
      bodySizeLimit: '15mb',
    },
  },
});