/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/Components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        appgreen: '#54B095',
      },
    },
  },
  plugins: [],
}
