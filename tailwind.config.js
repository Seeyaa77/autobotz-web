/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        'heading': ['"Outfit"', '"Plus Jakarta Sans"', 'sans-serif'],
        'brand': ['"Outfit"', '"Plus Jakarta Sans"', 'sans-serif'],
        'mono': ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          pink: '#FD1843',
          'pink-hover': '#E00E36',
          'chill-white': '#FFF9FA',
          'surface-tint': '#FFF0F3',
          dark: '#111217',
          muted: '#5A5E6D',
          border: '#111217',
          mint: '#10B981',
          blue: '#2563EB',
          amber: '#F59E0B',
        }
      },
      boxShadow: {
        'brutalist-sm': '2px 2px 0px 0px #111217',
        'brutalist': '4px 4px 0px 0px #111217',
        'brutalist-hover': '6px 6px 0px 0px #111217',
        'brutalist-lg': '8px 8px 0px 0px #111217',
        'brutalist-pink': '4px 4px 0px 0px #FD1843',
        'brutalist-pink-lg': '6px 6px 0px 0px #FD1843',
        'brutalist-mint': '4px 4px 0px 0px #10B981',
        'brutalist-none': '0px 0px 0px 0px #111217',
      },
      borderRadius: {
        'brutalist': '12px',
        'brutalist-lg': '16px',
        'brutalist-xl': '24px',
      }
    },
  },
  plugins: [],
}
