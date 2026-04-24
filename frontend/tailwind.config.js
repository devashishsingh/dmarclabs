/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        card: '#0d0d0d',
        border: '#1f1f1f',
        accent: '#ef233c',
        'accent-hover': '#c81f33',
        'text-primary': '#ffffff',
        'text-secondary': '#d4d4d8',
        'text-muted': '#71717a',
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        layout: '1200px',
      },
    },
  },
  plugins: [],
};
