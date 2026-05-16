// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {fontFamily: {
      mono: ['"DM Mono"', 'monospace'],
      serif: ['Fraunces', 'serif'],
    }},
  },
  plugins: [require('tailwind-scrollbar-hide')],
}