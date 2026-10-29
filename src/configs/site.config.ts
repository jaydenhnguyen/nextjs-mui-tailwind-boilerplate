type SocialLink = {
  label: string;
  href: string;
};

export const siteConfig = {
  name: 'NextJS Boilerplate',
  shortName: 'Boilerplate',
  description: 'A Next.js + MUI + Tailwind starter.',
  url: process.env['NEXT_PUBLIC_SITE_URL'] ?? 'http://localhost:3000',
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
