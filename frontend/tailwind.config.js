/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./frontend/index.html",
    "./frontend/src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Master Exact Theme Color Tokens
        border: '#26272D',
        input: '#1B1B1D',
        ring: '#2FE92B',

        // Primary Green
        primary: {
          DEFAULT: '#2FE92B',
          hover: '#24C421',
          light: '#55EE52',
          dark: '#1EA01B',
          foreground: '#000000',
        },

        // Chart Palette
        chart: {
          1: '#2FE92B',
          2: '#FF9821',
          3: '#F57733',
          4: '#FF5102',
          5: '#6B7367',
        },

        // Hospital Palette (powers all hospital-* classes across the platform)
        hospital: {
          50: '#F0FDF0',
          100: '#DCFCDC',
          200: '#B8F8B7',
          300: '#7DF27B',
          400: '#55EE52',
          500: '#2FE92B',
          600: '#2FE92B',
          700: '#24C421',
          800: '#1EA01B',
          900: '#188216',
          950: '#0B4A0A',
        },

        // Secondary / Accent Colors
        secondary: {
          DEFAULT: '#26272D',
          hover: '#1B1B1D',
          light: '#35373F',
          dark: '#16171A',
        },

        // Mapped Emerald to Primary Green (#2FE92B)
        emerald: {
          50: '#F0FDF0',
          100: '#DCFCDC',
          200: '#B8F8B7',
          300: '#7DF27B',
          400: '#55EE52',
          500: '#2FE92B',
          600: '#2FE92B',
          700: '#24C421',
          800: '#1EA01B',
          900: '#188216',
          950: '#0B4A0A',
        },

        // Mapped Green to Primary Green (#2FE92B)
        green: {
          50: '#F0FDF0',
          100: '#DCFCDC',
          200: '#B8F8B7',
          300: '#7DF27B',
          400: '#55EE52',
          500: '#2FE92B',
          600: '#2FE92B',
          700: '#24C421',
          800: '#1EA01B',
          900: '#188216',
          950: '#0B4A0A',
        },

        // Chart 2 Orange mapping
        amber: {
          50: '#FFF8F0',
          100: '#FFEED9',
          400: '#FFAA3D',
          500: '#FF9821',
          600: '#FF9821',
          700: '#E07D10',
          800: '#B86208',
          900: '#8A4500',
        },

        // Chart 3 & 4 Red/Orange mappings
        orange: {
          50: '#FFF5F0',
          100: '#FFE5D9',
          400: '#F88D54',
          500: '#F57733',
          600: '#FF5102',
          700: '#D94300',
          800: '#B03500',
        },

        // Dark surface & border hierarchy aligned with #26272D, #1B1B1D
        slate: {
          50: '#F7F8F9',
          100: '#ECEEF1',
          200: '#E2E4E8',
          300: '#C7CAD0',
          400: '#8E929E',
          500: '#6B7367',
          600: '#4D534A',
          700: '#26272D', // Exact Border Token
          800: '#1E2024',
          900: '#1B1B1D', // Exact Input Background Token
          950: '#101114',
        },

        // Preserved tokens mapped to new exact palette
        'soft-sage': {
          DEFAULT: '#26272D',
          30: 'rgba(38, 39, 45, 0.3)',
        },
        'deep-forest': {
          DEFAULT: '#101114',
        },
        'muted-teal': {
          DEFAULT: '#6B7367',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.2)',
        'card': '0 10px 25px -5px rgba(47, 233, 43, 0.12)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [],
};
