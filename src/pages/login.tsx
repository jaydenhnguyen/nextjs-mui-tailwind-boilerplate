import * as React from 'react';
import { Seo } from 'src/components/Seo';
import { PublicLayout } from 'src/layouts';
import { Login } from 'src/modules/Authentication';

export default function LoginPage() {
  return (
    <>
      <Seo title="Sign in" />
      <Login />
    </>
  );
}

LoginPage.getLayout = (page: React.ReactElement) => <PublicLayout>{page}</PublicLayout>;
