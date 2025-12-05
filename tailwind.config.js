/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        body: ["'Inter'", "sans-serif"],
      },
      colors: {
        'academic-bg': '#050A18',
        'glass-surface': 'rgba(14, 23, 42, 0.75)',
        'glass-border': 'rgba(255, 255, 255, 0.25)',
        'primary-indigo': '#5663FF',
        'primary-indigo-strong': '#3A42CC',
        'accent-amber': '#F5C06D',
        'ink-muted': '#B9C2DE',
        'ink-strong': '#F8FBFF',
      },
      backgroundImage: {
        'academic-noise': "url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 160 160\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.08\'/%3E%3C/svg%3E')",
      },
      boxShadow: {
        glass: '0 20px 80px rgba(0, 0, 0, 0.35)',
      },
      borderRadius: {
        glass: '1.25rem',
      },
    },
  },
  plugins: [],
};
