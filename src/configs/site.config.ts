import { env } from './env';

type SiteIcon = {
  src: string;
  sizes: string;
  type: string;
};

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
  ogImage: undefined as string | undefined,
  icons: [] as SiteIcon[],
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
