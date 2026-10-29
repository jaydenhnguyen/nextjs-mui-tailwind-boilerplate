import { env } from './env';

type SocialLink = {
  label: string;
  href: string;
};

export const siteConfig = {
  name: 'NextJS Boilerplate',
  shortName: 'Boilerplate',
  description: 'A Next.js + MUI + Tailwind starter.',
  url: env.SITE_URL,
  locale: 'en',
  faviconEmoji: '📦',
  author: {
    name: '',
    url: '',
  },
  contact: {
    email: '',
  },
  socials: [] as SocialLink[],
};
