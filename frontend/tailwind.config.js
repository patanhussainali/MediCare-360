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
    // Responsive container with default padding
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        md: '2rem',
        lg: '2.5rem',
        xl: '3rem',
        '2xl': '4rem',
      },
    },
    extend: {
      // Extra-small breakpoint for small phones (320px – 474px)
      screens: {
        'xs': '475px',
      },
      colors: {
        // Master Exact Theme Color Tokens
        border: '#E1E5E8',
        input: '#F5F7F8',
        ring: '#22E62C',

        // Primary Green
        primary: {
          DEFAULT: '#22E62C',
          hover: '#19C923',
          light: '#76F17B',
          dark: '#0E6B25',
          foreground: '#FFFFFF',
        },

        // Chart Palette
        chart: {
          1: '#22E62C',
          2: '#168C27',
          3: '#75C94A',
          4: '#0E6B25',
          5: '#9DCB8B',
        },

        // Hospital Palette (powers all hospital-* classes across the platform)
        hospital: {
          50: '#ECFDEE',
          100: '#D6FAD9',
          200: '#B0F4B6',
          300: '#7BEB84',
          400: '#4FE65A',
          500: '#22E62C',
          600: '#19C923',
          700: '#149D1C',
          800: '#117A1A',
          900: '#0E5F18',
          950: '#083A10',
        },

        // Secondary / Accent Colors
        secondary: {
          DEFAULT: '#17191A',
          hover: '#252A2B',
          light: '#323839',
          dark: '#111314',
        },

        // Emerald is the shared brand-green palette.
        emerald: {
          50: '#ECFDEE', 100: '#D6FAD9', 200: '#B0F4B6', 300: '#7BEB84',
          400: '#4FE65A', 500: '#22E62C', 600: '#19C923', 700: '#149D1C',
          800: '#117A1A', 900: '#0E5F18', 950: '#083A10',
        },

        // Green classes use the same shared brand-green palette.
        green: {
          50: '#ECFDEE', 100: '#D6FAD9', 200: '#B0F4B6', 300: '#7BEB84',
          400: '#4FE65A', 500: '#22E62C', 600: '#19C923', 700: '#149D1C',
          800: '#117A1A', 900: '#0E5F18', 950: '#083A10',
        },

        // Chart 2 Orange mapping
        amber: {
          50: '#FBF5E8',
          100: '#F3E6C9',
          400: '#DDB56E',
          500: '#C99A4E',
          600: '#AD7E37',
          700: '#8A632B',
          800: '#694B24',
          900: '#49351D',
        },

        // Brand-green aliases used by existing orange-accented components.
        orange: {
          50: '#ECFDEE',
          100: '#D6FAD9',
          400: '#4FE65A',
          500: '#22E62C',
          600: '#19C923',
          700: '#149D1C',
          800: '#117A1A',
        },

        // Neutral gray surfaces shared across every portal.
        slate: {
          50: '#F8FAFB',
          100: '#F1F3F5',
          200: '#E4E7EB',
          300: '#CBD0D6',
          400: '#9198A1',
          500: '#68717C',
          600: '#4B5563',
          700: '#374151',
          800: '#252A30',
          900: '#181B1F',
          950: '#111315',
        },

        // Preserved tokens mapped to new exact palette
        'soft-sage': {
          DEFAULT: '#B0F4B6',
          30: 'rgba(176, 244, 182, 0.3)',
        },
        'deep-forest': {
          DEFAULT: '#117A1A',
        },
        'muted-teal': {
          DEFAULT: '#168C27',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.2)',
        'card': '0 12px 30px -12px rgba(30, 44, 35, 0.18)',
        'glass': '0 16px 42px 0 rgba(34, 120, 45, 0.14)',
      }
    },
  },
  plugins: [],
};
