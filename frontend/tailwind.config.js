/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#093c5d",
        blue: "#3b7597",
        teal: "#6fd1d7",
        mint: "#5df8d8",
        primary: "#093c5d", 
        secondary: "#3b7597", 
        accent: "#6fd1d7",
        background: "#f8fafc",
        surface: "#ffffff"
      }
    },
  },
  plugins: [],
}

