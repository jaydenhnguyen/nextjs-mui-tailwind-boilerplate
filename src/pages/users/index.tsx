import * as React from 'react';
import { Seo } from 'src/components/Seo';
import { PrivateLayout } from 'src/layouts';
import { Users } from 'src/modules/Users';

export default function UsersPage() {
  return (
    <>
      <Seo title="Users" noIndex />
      <Users />
    </>
  );
}

UsersPage.getLayout = (page: React.ReactElement) => <PrivateLayout>{page}</PrivateLayout>;
