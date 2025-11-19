/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aurora: {
          primary: '#004e92', // Deep Blue
          secondary: '#000428', // Darker Blue/Black
          accent: '#00c6ff', // Cyan/Light Blue
          surface: '#ffffff',
          text: '#333333',
          'text-light': '#f4f4f4',
        },
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
        }
      },
    },
  },
  plugins: [],
}
