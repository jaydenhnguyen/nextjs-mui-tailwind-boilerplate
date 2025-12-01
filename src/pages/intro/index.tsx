import * as React from 'react';
import Head from 'next/head';
import { PublicLayout } from 'src/layouts';
import { Introduction } from 'src/modules/Introduction';

export default function IntroductionPage(): React.ReactElement {
  return (
    <>
      <Head>
        <title>Introduction</title>
      </Head>

      <Introduction />
    </>
  );
}

IntroductionPage.getLayout = (page: React.ReactElement) => <PublicLayout>{page}</PublicLayout>;
