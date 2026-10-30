import * as React from 'react';
import { Seo } from 'src/components/Seo';
import { PrivateLayout } from 'src/layouts';
import { Home } from 'src/modules/Home';

export default function HomePage() {
  return (
    <>
      <Seo title="Home" noIndex />
      <Home />
    </>
  );
}

HomePage.getLayout = (page: React.ReactElement) => <PrivateLayout>{page}</PrivateLayout>;
