import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          'dark-blue': '#1B19A8',
          'sweet-rose': '#F49392',
          'vintage-blue': '#B1D4F0',
          'neon-green': '#E3F50D',
          'soft-white': '#FCFDFD',
          'deep-navy': '#07072C',
          canvas: '#F7F3E7',
        },
        // Map legacy utility usage to the new brand direction.
        blue: {
          50: '#F2F6FC',
          100: '#E3EDF9',
          200: '#C7DCF3',
          300: '#A3C6EC',
          400: '#6EA5E2',
          500: '#3E82D6',
          600: '#1B19A8',
          700: '#15127F',
          800: '#0F0D5D',
          900: '#07072C',
        },
        purple: {
          50: '#FEF5F7',
          100: '#FDE9EC',
          200: '#FBD2D9',
          300: '#F8B7C1',
          400: '#F7A5B0',
          500: '#F49392',
          600: '#EA6D7A',
          700: '#C84D61',
          800: '#9D3A4B',
          900: '#6F2736',
        },
        green: {
          50: '#F9FEE8',
          100: '#F3FCC8',
          200: '#EBF99A',
          300: '#E3F50D',
          400: '#C9DE0C',
          500: '#AEBF09',
          600: '#8F9D08',
          700: '#707C06',
          800: '#545C04',
          900: '#3A3F03',
        },
      },
      backgroundImage: {
        'brand-starter-kit': "url('/brand/jamii-aide-starter-kit.svg')",
        'brand-logomark': "url('/brand/jamii-aide-logomark.svg')",
      },
      fontFamily: {
        sans: ['var(--font-jamii)', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
