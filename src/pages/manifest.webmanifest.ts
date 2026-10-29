import { GetServerSideProps } from 'next';
import { siteConfig } from 'src/configs/site.config';
import { themeConfig } from 'src/theme/core/_config';

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const manifest = {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    lang: siteConfig.locale,
    start_url: '/',
    display: 'standalone',
    background_color: themeConfig.light.background.default,
    theme_color: themeConfig.brand.primary.main,
    icons: siteConfig.icons,
  };

  res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=3600');
  res.end(JSON.stringify(manifest));

  return { props: {} };
};

export default function Manifest() {
  return null;
}
