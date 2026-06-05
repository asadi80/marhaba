// app/manifest.js
export default function manifest() {
  const v = "2"; // ← bump this whenever you change the icon

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
        src: `/icon-192.png?v=${v}`,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `/icon-512.png?v=${v}`,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `/icon-512.png?v=${v}`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",   // ← needed for Android adaptive icons
      },
    ],
  };
}