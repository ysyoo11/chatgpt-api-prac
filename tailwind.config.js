module.exports = {
  content: ['./src/pages/**/*.{ts,tsx}', './src/components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      keyframes: {
        'cursor-blink': {
          '0%': { opacity: '0' },
        },
      },
      animation: {
        'cursor-blink': 'cursor-blink 1s steps(2) infinite',
      },
    },
  },
  plugins: [],
};
