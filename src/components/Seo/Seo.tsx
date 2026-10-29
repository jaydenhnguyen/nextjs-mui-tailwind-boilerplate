import Head from 'next/head';
import { useRouter } from 'next/router';
import { siteConfig } from 'src/configs/site.config';

type Props = {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
  type?: 'website' | 'article';
};

const toAbsoluteUrl = (path: string) => new URL(path, siteConfig.url).toString();

// Every tag has a `key`, so a page's <Seo> replaces the defaults from _app instead of duplicating them.
export function Seo({ title, description = siteConfig.description, image = siteConfig.ogImage, noIndex, type }: Props) {
  const { asPath } = useRouter();

  const fullTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name;
  const canonical = toAbsoluteUrl(asPath.split(/[?#]/)[0] ?? '/');
  const imageUrl = image ? toAbsoluteUrl(image) : undefined;

  return (
    <Head>
      <title key="title">{fullTitle}</title>
      <meta key="description" name="description" content={description} />
      <link key="canonical" rel="canonical" href={canonical} />
      {noIndex && <meta key="robots" name="robots" content="noindex, nofollow" />}

      <meta key="og:site_name" property="og:site_name" content={siteConfig.name} />
      <meta key="og:title" property="og:title" content={fullTitle} />
      <meta key="og:description" property="og:description" content={description} />
      <meta key="og:url" property="og:url" content={canonical} />
      <meta key="og:type" property="og:type" content={type ?? 'website'} />
      {imageUrl && <meta key="og:image" property="og:image" content={imageUrl} />}

      <meta key="twitter:card" name="twitter:card" content={imageUrl ? 'summary_large_image' : 'summary'} />
      <meta key="twitter:title" name="twitter:title" content={fullTitle} />
      <meta key="twitter:description" name="twitter:description" content={description} />
      {imageUrl && <meta key="twitter:image" name="twitter:image" content={imageUrl} />}
    </Head>
  );
}
