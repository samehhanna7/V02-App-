/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0a0a0f',
          secondary: '#12121a',
          card: '#1a1a26',
          elevated: '#1f1f2e',
        },
        accent: {
          DEFAULT: '#3b82f6',
          bright: '#60a5fa',
          dim: '#1d4ed8',
        },
        zone: {
          1: '#22d3ee',
          2: '#34d399',
          3: '#fbbf24',
          4: '#f97316',
          5: '#ef4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

