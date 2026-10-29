import * as React from 'react';
import { Seo } from 'src/components/Seo';
import { PublicLayout } from 'src/layouts';
import { Introduction } from 'src/modules/Introduction';

export default function IntroductionPage() {
  return (
    <>
      <Seo title="Introduction" />
      <Introduction />
    </>
  );
}

IntroductionPage.getLayout = (page: React.ReactElement) => <PublicLayout>{page}</PublicLayout>;
