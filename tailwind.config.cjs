/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,svelte,ts,js}',
  ],
  theme: {
    extend: {
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
      },
      colors: {
        // Catppuccin Latte (Light) Theme
        'ctp-base': '#eff1f5',
        'ctp-mantle': '#e6e9ef',
        'ctp-crust': '#dce0e8',
        'ctp-surface0': '#ccd0da',
        'ctp-surface1': '#bcc0cc',
        'ctp-surface2': '#acb0be',
        'ctp-text': '#4c4f69',
        'ctp-subtext0': '#6c6f85',
        'ctp-subtext1': '#5c5f77',
        'ctp-mauve': '#8839ef',
        'ctp-sapphire': '#209fb5',
        'ctp-green': '#40a02b',
        'ctp-yellow': '#df8e1d',
        'ctp-peach': '#fe640b',
        'ctp-pink': '#ea76cb',
        'ctp-red': '#d20f39'
      }
    }
  },
  darkMode: 'class'
};
