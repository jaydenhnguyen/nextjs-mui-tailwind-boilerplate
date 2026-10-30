import { DocumentContext, DocumentProps, Head, Html, Main, NextScript } from 'next/document';
import { documentGetInitialProps, DocumentHeadTags, DocumentHeadTagsProps } from '@mui/material-nextjs/v16-pagesRouter';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import { siteConfig } from 'src/configs/site.config';
import { themeConfig } from 'src/theme/core/_config';
import { createAppEmotionCache } from 'src/theme/emotionCache';
import { DEFAULT_THEME_MODE } from 'src/theme/theme';

// Imports here skip the 'src/theme' barrel on purpose, because Next.js doesn't allow next/font inside _document.
export default function AppDocument(props: DocumentProps & DocumentHeadTagsProps) {
  return (
    <Html lang={siteConfig.locale} suppressHydrationWarning>
      <Head>
        <DocumentHeadTags {...props} />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content={themeConfig.light.background.default} />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content={themeConfig.dark.background.default} />
      </Head>

      <body>
        <InitColorSchemeScript attribute="class" defaultMode={DEFAULT_THEME_MODE} />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

AppDocument.getInitialProps = async (ctx: DocumentContext) =>
  documentGetInitialProps(ctx, { emotionCache: createAppEmotionCache() });
