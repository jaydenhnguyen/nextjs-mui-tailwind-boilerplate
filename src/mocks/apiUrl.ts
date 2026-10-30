import { env } from 'src/configs/env';

export const apiUrl = (path: string) => `${env.API_URL}${path}`;
