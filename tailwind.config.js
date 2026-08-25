/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        japan: {
          red: '#E63946',
          darkRed: '#D62828',
          pink: '#FDE2E4',
          gold: '#E9C46A',
          cream: '#FFF9F4',
          navy: '#1D3557',
          softBlue: '#F1FAEE',
          slate: '#457B9D',
        }
      }
    },
  },
  plugins: [],
}
