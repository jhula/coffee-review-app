/** @type {import('postcss').Config} */
const config = {
  plugins: {
    // Tailwind 4 uses its own PostCSS plugin
    "@tailwindcss/postcss": {},
    autoprefixer: {},
  },
};

export default config;
