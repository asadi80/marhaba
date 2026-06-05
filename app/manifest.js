// app/manifest.js
export default function manifest() {
  return {
    name: 'Marhaba',
    short_name: 'Marhaba',
    description: 'Whether you are looking for the perfect stay or want to share your space — Marhaba brings travelers and hosts together.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}