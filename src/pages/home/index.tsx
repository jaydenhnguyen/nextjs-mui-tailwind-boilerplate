import * as React from 'react';
import Head from 'next/head';
import { PrivateLayout } from 'src/layouts';
import { Home } from 'src/modules/Home';

export default function HomePage(): React.ReactElement {
  return (
    <>
      <Head>
        <title>Home Page</title>
      </Head>

      <Home />
    </>
  );
}

HomePage.getLayout = (page: React.ReactElement) => <PrivateLayout>{page}</PrivateLayout>;
