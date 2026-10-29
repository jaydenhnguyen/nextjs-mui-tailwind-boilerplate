import { GetServerSideProps } from 'next';
import { siteConfig } from 'src/configs/site.config';
import { NO_INDEX_ROUTES } from 'src/shared/constants/routes.constant';

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const disallow = NO_INDEX_ROUTES.map((route) => `Disallow: ${route}`).join('\n');

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=3600');
  res.end(`User-agent: *\nAllow: /\n${disallow}\n\nSitemap: ${new URL('/sitemap.xml', siteConfig.url).toString()}\n`);

  return { props: {} };
};

export default function Robots() {
  return null;
}
