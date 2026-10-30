import type { Config } from 'tailwindcss';
import { BREAKPOINTS } from './src/theme/core/breakpoints';

// Colors point at MUI's CSS variables, so every Tailwind color follows light/dark mode automatically.
const withAlpha = (name: string) => `rgb(var(--mui-palette-${name}Channel) / <alpha-value>)`;
const plain = (name: string) => `var(--mui-palette-${name})`;

const scale = (color: string) => ({
  lighter: plain(`${color}-lighter`),
  light: withAlpha(`${color}-light`),
  main: withAlpha(`${color}-main`),
  dark: withAlpha(`${color}-dark`),
  darker: plain(`${color}-darker`),
  contrast: withAlpha(`${color}-contrastText`),
});

const greyShades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'] as const;

const screens = Object.fromEntries(
  Object.entries(BREAKPOINTS)
    .filter(([key]) => key !== 'xs')
    .map(([key, px]) => [key, `${px}px`]),
);

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'selector',
  theme: {
    screens,
    extend: {
      colors: {
        primary: scale('primary'),
        secondary: scale('secondary'),
        info: scale('info'),
        success: scale('success'),
        warning: scale('warning'),
        error: scale('error'),
        grey: Object.fromEntries(greyShades.map((shade) => [shade, plain(`grey-${shade}`)])),
        common: { black: plain('common-black'), white: plain('common-white') },
        background: { default: withAlpha('background-default'), paper: withAlpha('background-paper') },
        text: {
          primary: withAlpha('text-primary'),
          secondary: withAlpha('text-secondary'),
          disabled: plain('text-disabled'),
        },
        divider: plain('divider'),
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      borderRadius: {
        theme: 'var(--mui-shape-borderRadius)',
      },
    },
  },
  corePlugins: { preflight: false },
};

export default config;
