/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090b',
        card: '#18181b',
        border: 'rgba(255, 255, 255, 0.08)',
        primary: '#8b5cf6',
        secondary: '#06b6d4',
        'text-primary': '#fafafa',
        'text-secondary': '#a1a1aa',
      },
    },
  },
  plugins: [],
}
