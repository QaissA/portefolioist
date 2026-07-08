/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--color-bg) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--color-surface-2) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        amber: {
          DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
          50: '#FFFBEB',
          100: '#FEF3C7',
          400: 'rgb(var(--color-accent-400) / <alpha-value>)',
          500: 'rgb(var(--color-accent) / <alpha-value>)',
          600: 'rgb(var(--color-accent-600) / <alpha-value>)',
          900: '#78350F',
        },
        accent2: 'rgb(var(--color-accent-2) / <alpha-value>)',
        'text-primary': 'rgb(var(--color-text-primary) / <alpha-value>)',
        'text-secondary': 'rgb(var(--color-text-secondary) / <alpha-value>)',
        'text-muted': 'rgb(var(--color-text-muted) / <alpha-value>)',
        skill: {
          frontend: '#F59E0B',
          backend: '#10B981',
          mobile: '#0EA5E9',
          ai: '#8B5CF6',
          devops: '#F43F5E',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Space Grotesk', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
        'marquee-reverse': 'marquee-reverse 30s linear infinite',
        'marquee-contact': 'marquee 18s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
      },
    },
  },
  plugins: [],
}
