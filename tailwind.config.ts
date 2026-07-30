import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Top End Visuals brand tokens — grounded in a Darwin dry-season
        // Christmas: harbour dusk, poinciana bloom, spinifex gold.
        ink: {
          DEFAULT: '#0E1B1D', // near-black tropical dusk teal
          800: '#132A2D',
          700: '#1B3A3D',
        },
        harbour: {
          DEFAULT: '#123338', // deep teal
          600: '#17454B',
          500: '#1F5A61',
        },
        sand: {
          DEFAULT: '#F6F0E4', // warm sand/cream page background
          100: '#FBF8F1',
          200: '#EFE6D2',
        },
        gold: {
          DEFAULT: '#D9A441', // spinifex / late-light gold
          600: '#C28E31',
          400: '#E6BE6C',
        },
        poinciana: {
          DEFAULT: '#C1442D', // poinciana bloom red-orange — the "Top End Christmas" accent
          600: '#A6371F',
          400: '#D96A4E',
        },
        ink50: '#FAF7F0',
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'ui-serif', 'Georgia', 'serif'],
        body: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'horizon-gradient': 'linear-gradient(90deg, #123338 0%, #D9A441 55%, #C1442D 100%)',
        'dusk-gradient': 'linear-gradient(180deg, #0E1B1D 0%, #17454B 60%, #1F5A61 100%)',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        drift: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '1' },
          '100%': { transform: 'translateY(120px) rotate(45deg)', opacity: '0' },
        },
      },
      animation: {
        rise: 'rise 0.8s cubic-bezier(0.16,1,0.3,1) both',
        drift: 'drift 6s ease-in both',
      },
    },
  },
  plugins: [],
};

export default config;
