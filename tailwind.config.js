/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary backgrounds
        'forest': '#0D1F1A',
        'navy': '#0A1628',
        'forest-light': '#132A23',
        'navy-light': '#0F1E38',
        // Parchment / diary panels
        'parchment': '#F5ECD7',
        'parchment-dark': '#E8D5B7',
        'parchment-light': '#FBF5E8',
        // Accents
        'gold': '#C9972C',
        'gold-light': '#E3B84A',
        'gold-dark': '#A07A1F',
        'rust': '#9B3A2A',
        'rust-light': '#C44E3A',
        'sage': '#6B8F71',
        'sage-light': '#8BAF92',
        // Text
        'cream': '#E8DCC8',
        'cream-muted': '#8A9E96',
        'cream-dim': '#5A6E68',
      },
      fontFamily: {
        'fraunces': ['Fraunces', 'Georgia', 'serif'],
        'inter': ['Inter', 'system-ui', 'sans-serif'],
        'caveat': ['Caveat', 'cursive'],
        'mono': ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E\")",
      },
      animation: {
        'stamp-in': 'stampIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'fade-up': 'fadeUp 0.5s ease forwards',
        'float': 'float 6s ease-in-out infinite',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
      },
      keyframes: {
        stampIn: {
          '0%': { transform: 'scale(0.3) rotate(-15deg)', opacity: '0' },
          '100%': { transform: 'scale(1) rotate(var(--stamp-rotation, -2deg))', opacity: '1' },
        },
        fadeUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(201, 151, 44, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(201, 151, 44, 0)' },
        },
      },
      boxShadow: {
        'stamp': '0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        'card': '0 8px 32px rgba(0,0,0,0.3)',
        'gold-glow': '0 0 20px rgba(201, 151, 44, 0.3)',
      },
    },
  },
  plugins: [],
}
