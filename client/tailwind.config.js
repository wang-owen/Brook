/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        fontFamily: {
            sans: ["Roboto", "sans-serif"]
        },
        backgroundImage: {
            'brew-hero': "url('src/assets/img/brook-piano-transparent.png')",
        }
    },
  },
  plugins: [],
}

