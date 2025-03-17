/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        darkMode: 'class',
        content: [
                "./index.html",
                "./src/**/*.{js,ts,jsx,tsx}",
            ],
      extend: {
        keyframes: {
          typing: {
            '0%': { width: '0%' },
            '100%': { width: '100%' }
          },
          blink: {
            '50%': { borderColor: 'transparent' },
            '100%': { borderColor: 'white' }
          }
        },
        animation: {
          typing: 'typing 2s steps(20) forwards',
          blink: 'blink 1s step-end infinite'
        }
      },
    },
    plugins: [],
  }
  