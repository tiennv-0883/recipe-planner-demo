import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fef9f0',
          100: '#fdefd6',
          200: '#f9d9a8',
          300: '#f4bc70',
          400: '#ef9a38',
          500: '#eb7e14',
          600: '#d4620e',
          700: '#b0490e',
          800: '#8d3a12',
          900: '#733112',
          950: '#3e1706',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
