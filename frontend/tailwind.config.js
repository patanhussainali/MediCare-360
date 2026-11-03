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
        border: '#DED5C6',
        input: '#F5F0E7',
        ring: '#B96337',

        // Primary Green
        primary: {
          DEFAULT: '#A64E2E',
          hover: '#873B27',
          light: '#CC8050',
          dark: '#66301F',
          foreground: '#FFFFFF',
        },

        // Chart Palette
        chart: {
          1: '#A64E2E',
          2: '#D59A52',
          3: '#667C58',
          4: '#7A4531',
          5: '#9A8D77',
        },

        // Hospital Palette (powers all hospital-* classes across the platform)
        hospital: {
          50: '#FBF3E8',
          100: '#F5E4CB',
          200: '#E9C49A',
          300: '#DDA66E',
          400: '#CC8050',
          500: '#B96337',
          600: '#A64E2E',
          700: '#873B27',
          800: '#66301F',
          900: '#452417',
          950: '#291B15',
        },

        // Secondary / Accent Colors
        secondary: {
          DEFAULT: '#34473B',
          hover: '#25352B',
          light: '#526856',
          dark: '#1D2922',
        },

        // Mapped Emerald to Primary Green (#2FE92B)
        emerald: {
          50: '#F1F4EC',
          100: '#E2E9D9',
          200: '#C8D6B9',
          300: '#A9BE94',
          400: '#8FA777',
          500: '#758F62',
          600: '#627B52',
          700: '#4D6242',
          800: '#3C4D35',
          900: '#303E2C',
          950: '#192219',
        },

        // Mapped Green to Primary Green (#2FE92B)
        green: {
          50: '#F1F4EC',
          100: '#E2E9D9',
          200: '#C8D6B9',
          300: '#A9BE94',
          400: '#8FA777',
          500: '#758F62',
          600: '#627B52',
          700: '#4D6242',
          800: '#3C4D35',
          900: '#303E2C',
          950: '#192219',
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

        // Chart 3 & 4 Red/Orange mappings
        orange: {
          50: '#FBF0EA',
          100: '#F4DDD0',
          400: '#D48A61',
          500: '#BD6B43',
          600: '#A64E2E',
          700: '#873B27',
          800: '#66301F',
        },

        // Dark surface & border hierarchy aligned with #26272D, #1B1B1D
        slate: {
          50: '#F7F3EA',
          100: '#F0E9DD',
          200: '#E0D6C5',
          300: '#C5B9A7',
          400: '#948A7C',
          500: '#71695D',
          600: '#574F47',
          700: '#403A34',
          800: '#322E29',
          900: '#25241F',
          950: '#171915',
        },

        // Preserved tokens mapped to new exact palette
        'soft-sage': {
          DEFAULT: '#D6C8AE',
          30: 'rgba(214, 200, 174, 0.3)',
        },
        'deep-forest': {
          DEFAULT: '#26382D',
        },
        'muted-teal': {
          DEFAULT: '#667C58',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.2)',
        'card': '0 12px 30px -12px rgba(76, 57, 38, 0.2)',
        'glass': '0 16px 42px 0 rgba(38, 56, 45, 0.16)',
      }
    },
  },
  plugins: [],
};
