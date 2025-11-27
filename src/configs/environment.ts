export const envVariables = {
  APP_NAME: process.env['NEXT_PUBLIC_APP_NAME'],
  BASE_API_URL: `${process.env['NEXT_PUBLIC_BASE_API_URL']}/api/v${process.env['NEXT_PUBLIC_API_VERSION']}`,
  ACCESS_TOKEN_TTL: Number(process.env['ACCESS_TOKEN_TTL']) ?? 3600,
  REFRESH_TOKEN_TTL: Number(process.env['REFRESH_TOKEN_TTL']) ?? 36000,
};
