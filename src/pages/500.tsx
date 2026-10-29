import * as React from 'react';
import { Seo } from 'src/components/Seo';
import { StatusPage } from 'src/components/StatusPage';
import { PublicLayout } from 'src/layouts';

export default function ServerErrorPage() {
  return (
    <>
      <Seo title="Something went wrong" noIndex />
      <StatusPage
        code={500}
        title="Something went wrong"
        description="We hit a problem on our side. Please try again in a moment."
      />
    </>
  );
}

ServerErrorPage.getLayout = (page: React.ReactElement) => <PublicLayout>{page}</PublicLayout>;
