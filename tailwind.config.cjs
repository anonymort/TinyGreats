/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,svelte,ts,js}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#0f1115',
          light: '#f7f7f8'
        },
        pastel: {
          peach: '#F8C6B8',
          mint: '#BFE3D0',
          lavender: '#CFC7F8',
          sky: '#C6E4F6'
        }
      },
      fontFamily: {
        serif: ["var(--font-serif)"],
        sans: ["var(--font-sans)"]
      },
      spacing: {
        0.5: '2px',
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
        10: '40px',
        12: '48px'
      }
    }
  },
  darkMode: 'class'
};
