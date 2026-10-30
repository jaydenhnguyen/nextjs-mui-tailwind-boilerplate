import { APP_ROUTES } from 'src/shared/constants/routes.constant';

export type NavItem = {
  label: string;
  href: string;
  external?: boolean;
};

export const navigationConfig = {
  public: [] as NavItem[],
  private: [
    { label: 'Home', href: APP_ROUTES.HOME },
    { label: 'Users', href: APP_ROUTES.USERS },
  ] as NavItem[],
  footer: [] as NavItem[],
};
