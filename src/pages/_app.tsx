import * as React from 'react';
import Head from 'next/head';
import { NextPage } from 'next';
import { AppProps } from 'next/app';
import { EmotionCache } from '@emotion/react';
import { ToastContainer } from 'react-toastify';
import { AppCacheProvider } from '@mui/material-nextjs/v16-pagesRouter';
import 'src/styles/_app.scss';
import 'src/styles/_core.scss';
import 'src/styles/tailwind.scss';
import { siteConfig } from 'src/configs';
import { useScrollToTop } from 'src/hooks';
import { AllAppContexts, UserContextProvider } from 'src/context';
import { AppThemeProvider, createAppEmotionCache } from 'src/theme';

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
  emotionCache?: EmotionCache;
};

const clientEmotionCache = createAppEmotionCache();

const faviconHref = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${siteConfig.faviconEmoji}</text></svg>`;

function App({ Component, pageProps, emotionCache = clientEmotionCache }: AppPropsWithLayout) {
  useScrollToTop();

  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <AppCacheProvider emotionCache={emotionCache}>
      <Head>
        <title>{siteConfig.name}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href={faviconHref} />
      </Head>

      <AllAppContexts>
        <AppThemeProvider>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar
            newestOnTop
            closeOnClick
            pauseOnFocusLoss
            pauseOnHover
          />
          <UserContextProvider>{getLayout(<Component {...pageProps} />)}</UserContextProvider>
        </AppThemeProvider>
      </AllAppContexts>
    </AppCacheProvider>
  );
}

export default App;
