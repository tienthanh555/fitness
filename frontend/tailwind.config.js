/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50:'#effaf4',100:'#d8f3e3',200:'#b3e6c9',300:'#82d3aa',400:'#4dbb87',500:'#28a36f',600:'#198257',700:'#176747',800:'#15523b',900:'#124431' },
        ink: '#17211b',
        canvas: '#f5f8f6',
      },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      boxShadow: { soft: '0 12px 40px rgba(25, 63, 43, .08)', lift: '0 18px 55px rgba(25, 63, 43, .13)' },
      borderRadius: { '2xl': '1.25rem', '3xl': '1.75rem' },
      keyframes: { rise: { from:{ opacity:'0', transform:'translateY(8px)' }, to:{ opacity:'1', transform:'translateY(0)' } } },
      animation: { rise: 'rise .35s ease-out both' },
    },
  },
  plugins: [],
}
