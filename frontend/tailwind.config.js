/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        red: {
          DEFAULT: '#E03535',
          lt: '#FFF0F0',
          dk: '#8C1A1A',
        },
        ink: {
          DEFAULT: '#111110',
          2: '#44443F',
          3: '#888780',
        },
        bone: '#F7F6F2',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        syne: ['Syne', 'sans-serif'],
      },
      borderRadius: {
        custom: '10px',
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.06)',
      }
    },
  },
  plugins: [],
}
