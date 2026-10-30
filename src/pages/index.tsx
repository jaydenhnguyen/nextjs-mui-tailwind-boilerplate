import * as React from 'react';
import { Seo } from 'src/components/Seo';
import { PublicLayout } from 'src/layouts';
import { Landing } from 'src/modules/Landing';

export default function LandingPage() {
  return (
    <>
      <Seo />
      <Landing />
    </>
  );
}

LandingPage.getLayout = (page: React.ReactElement) => <PublicLayout>{page}</PublicLayout>;
