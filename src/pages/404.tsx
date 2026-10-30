import * as React from 'react';
import { Seo } from 'src/components/Seo';
import { StatusPage } from 'src/components/StatusPage';
import { PublicLayout } from 'src/layouts';

export default function NotFoundPage() {
  return (
    <>
      <Seo title="Page not found" noIndex />
      <StatusPage
        code={404}
        title="Page not found"
        description="The page you're looking for doesn't exist or has been moved."
      />
    </>
  );
}

NotFoundPage.getLayout = (page: React.ReactElement) => <PublicLayout>{page}</PublicLayout>;
