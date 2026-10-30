// Must match the folder structure in src/pages.
export const APP_ROUTES = {
  LANDING: '/',
  LOGIN: '/login',
  HOME: '/home',
  USERS: '/users',
};

export const SITEMAP_ROUTES: string[] = [APP_ROUTES.LANDING];

export const NO_INDEX_ROUTES: string[] = [APP_ROUTES.HOME, APP_ROUTES.USERS];
