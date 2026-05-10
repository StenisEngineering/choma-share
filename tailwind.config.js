/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        green:  '#0f7a4b',
        green2: '#15a66a',
        lime:   '#c8f26d',
        gold:   '#f8c85a',
        dark:   '#07130e',
        dark2:  '#0c2118',
      },
      fontFamily: {
        sans:    ['"DM Sans"', 'sans-serif'],
        display: ['"Fraunces"', 'serif'],
      },
    },
  },
  plugins: [],
}
