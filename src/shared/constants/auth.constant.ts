import { envVariables } from 'src/configs';

export const CookieKey = {
  AccessToken: `${envVariables.APP_NAME}_accessToken`,
  RefreshToken: `${envVariables.APP_NAME}_refreshToken`,
};
