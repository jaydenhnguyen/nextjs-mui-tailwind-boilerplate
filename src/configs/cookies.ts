import Cookies from 'js-cookie';
import isNil from 'lodash/isNil';
import { addSeconds } from 'date-fns';

export class CookiesStorage {
  private readonly cookies;

  constructor() {
    this.cookies = Cookies;
  }

  get(key: string): string | undefined {
    return this.cookies.get(key) as string | undefined;
  }

  setCookieData(key: string, data: string | number | null | undefined, expireIn?: number, path?: string) {
    if (isNil(data)) return;

    const domain = window.location.hostname;
    const expires = addSeconds(new Date(), expireIn ?? 3600);

    return this.cookies.set(key, data.toString(), { domain, expires, path: path ?? '/' });
  }

  clearCookieData(key: string, path = '/'): void {
    const domain = window.location.hostname;
    this.cookies.remove(key, { domain, path: path ?? '/' });
  }
}

export const cookiesStorage = new CookiesStorage();
