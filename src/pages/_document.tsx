import { DocumentContext, DocumentProps, Head, Html, Main, NextScript } from 'next/document';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import { DocumentHeadTags, DocumentHeadTagsProps, documentGetInitialProps } from '@mui/material-nextjs/v16-pagesRouter';
import { siteConfig } from 'src/configs/site.config';
import { DEFAULT_THEME_MODE } from 'src/theme/theme';
import { createAppEmotionCache } from 'src/theme/emotionCache';

// Imports here skip the 'src/theme' barrel on purpose, because Next.js doesn't allow next/font inside _document.
export default function AppDocument(props: DocumentProps & DocumentHeadTagsProps) {
  return (
    <Html lang={siteConfig.locale} suppressHydrationWarning>
      <Head>
        <DocumentHeadTags {...props} />
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
