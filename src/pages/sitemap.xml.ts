import { GetServerSideProps } from 'next';
import { siteConfig } from 'src/configs/site.config';
import { SITEMAP_ROUTES } from 'src/shared/constants/routes.constant';

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const urls = SITEMAP_ROUTES.map(
    (route) => `  <url><loc>${new URL(route, siteConfig.url).toString()}</loc></url>`,
  ).join('\n');

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=3600');
  res.end(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
  );

  return { props: {} };
};

export default function Sitemap() {
  return null;
}
