import type { Config } from 'tailwindcss';

/** `hsl(var(--x) / <alpha>)` lets opacity modifiers work on token colours. */
const token = (name: string) => `hsl(var(--${name}) / <alpha-value>)`;

const config: Config = {
  // Dark mode is opt-in via a `.dark` class on <html>, set by ThemeProvider.
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/shared/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: token('background'),
        foreground: token('foreground'),
        border: token('border'),
        ring: token('ring'),
        card: {
          DEFAULT: token('card'),
          foreground: token('card-foreground'),
        },
        muted: {
          DEFAULT: token('muted'),
          foreground: token('muted-foreground'),
        },
        primary: {
          DEFAULT: token('primary'),
          foreground: token('primary-foreground'),
        },
        accent: {
          DEFAULT: token('accent'),
          foreground: token('accent-foreground'),
        },
        danger: {
          DEFAULT: token('danger'),
          foreground: token('danger-foreground'),
        },
        success: token('success'),
        warning: token('warning'),
      },
    },
  },
  plugins: [],
};

export default config;
