import { env } from 'src/configs/env';

export const CookieKey = {
  AccessToken: `${env.APP_KEY}_accessToken`,
  RefreshToken: `${env.APP_KEY}_refreshToken`,
};
