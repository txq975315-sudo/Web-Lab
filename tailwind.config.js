/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lab: {
          base: 'var(--color-bg-base)',
          raised: 'var(--color-bg-raised)',
          overlay: 'var(--color-bg-overlay)',
          inverted: 'var(--color-bg-inverted)',
          sidebar: 'var(--color-bg-sidebar)',
          accent: 'var(--color-accent-orange)',
          'accent-warm': 'var(--color-accent-warm)',
          'accent-blue': 'var(--color-accent-blue)',
          'accent-green': 'var(--color-accent-green)',
          'accent-dim': 'var(--color-accent-dim)',
          border: 'var(--color-border-default)',
          'border-subtle': 'var(--color-border-subtle)',
          ink: 'var(--color-text-primary)',
          muted: 'var(--color-text-secondary)',
          faint: 'var(--color-text-muted)',
          error: 'var(--color-error)',
          success: 'var(--color-success)',
          warning: 'var(--color-warning)',
        },
      },
      fontFamily: {
        display: ['var(--font-display-cn)', 'var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-heading-cn)', 'var(--font-heading)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body-cn)', 'var(--font-body)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        lab: 'var(--radius-lg)',
        card: 'var(--radius-card)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        elevated: 'var(--shadow-elevated)',
      },
      transitionTimingFunction: {
        lab: 'var(--ease-default)',
      },
    },
  },
  plugins: [],
}
