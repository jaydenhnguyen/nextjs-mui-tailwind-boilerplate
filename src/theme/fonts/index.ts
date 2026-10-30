import { Geist, Geist_Mono } from 'next/font/google';

const sans = Geist({ subsets: ['latin'], display: 'swap' });
const mono = Geist_Mono({ subsets: ['latin'], display: 'swap' });

const SYSTEM_FALLBACK =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"';

export const FONT_VARIABLES = {
  '--font-sans': `${sans.style.fontFamily}, ${SYSTEM_FALLBACK}`,
  '--font-mono': `${mono.style.fontFamily}, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`,
};
