/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#f7f9fc',
        primary: {
          DEFAULT: '#1a1f36',
          dark: '#03071d',
          light: '#2d3452',
        },
        accent: {
          DEFAULT: '#00f5d4',
          dark: '#00bfa5',
          light: '#5cffea',
        },
        secondary: {
          DEFAULT: '#006b5b',
          light: '#008a75',
        },
        warning: {
          DEFAULT: '#ffd166',
          dark: '#e5b338',
        },
        card: '#ffffff',
        surface: {
          dim: '#eceef1',
          border: '#e2e8f0',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(26, 31, 54, 0.06)',
        'elevated': '0 12px 40px -10px rgba(3, 7, 29, 0.08)',
        'glow': '0 0 20px -2px rgba(0, 245, 212, 0.35)',
      },
      backdropBlur: {
        'glass': '12px',
      }
    },
  },
  plugins: [],
}
