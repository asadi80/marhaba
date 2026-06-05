// app/manifest.js
const ICON_VERSION = "4"; 

export default function manifest() {
  return {
    name: "Marhaba",
    short_name: "Marhaba",
    description: "Whether you are looking for the perfect stay or want to share your space — Marhaba brings travelers and hosts together.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1a1a2e",
    icons: [
      {
        src: `/icon-192-v4.png?v=${ICON_VERSION}`,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `/icon-512-v4.png?v=${ICON_VERSION}`,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `/icon-512-v4.png?v=${ICON_VERSION}`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}