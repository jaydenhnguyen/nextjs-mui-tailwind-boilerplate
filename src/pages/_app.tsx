import * as React from 'react';
import Head from 'next/head';
import { NextPage } from 'next';
import { AppProps } from 'next/app';
import { EmotionCache } from '@emotion/react';
import { AppCacheProvider } from '@mui/material-nextjs/v16-pagesRouter';
import 'src/styles/_app.scss';
import 'src/styles/_core.scss';
import 'src/styles/tailwind.scss';
import { setupZod, siteConfig } from 'src/configs';
import { AppProviders } from 'src/providers';
import { createAppEmotionCache } from 'src/theme';
import { Seo } from 'src/components/Seo';
import { ApiMockingGate } from 'src/mocks';

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
  emotionCache?: EmotionCache;
};

setupZod();

const clientEmotionCache = createAppEmotionCache();

const faviconHref = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${siteConfig.faviconEmoji}</text></svg>`;

function App({ Component, pageProps, emotionCache = clientEmotionCache }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <AppCacheProvider emotionCache={emotionCache}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href={faviconHref} />
      </Head>
      <Seo />

      <AppProviders>
        <ApiMockingGate>{getLayout(<Component {...pageProps} />)}</ApiMockingGate>
      </AppProviders>
    </AppCacheProvider>
  );
}

export default App;
