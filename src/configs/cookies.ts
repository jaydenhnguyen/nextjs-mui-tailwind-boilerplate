import Cookies from 'js-cookie';

type SetOptions = {
  expiresIn?: number;
  path?: string;
};

const isHttps = () => typeof window !== 'undefined' && window.location.protocol === 'https:';

// Any script on the page can read these, so never store anything that would hurt if leaked.
export const cookieStorage = {
  get(key: string): string | undefined {
    return Cookies.get(key);
  },

  set(key: string, value: string, { expiresIn, path = '/' }: SetOptions = {}) {
    Cookies.set(key, value, {
      path,
      sameSite: 'lax',
      secure: isHttps(),
      expires: expiresIn === undefined ? undefined : new Date(Date.now() + expiresIn * 1000),
    });
  },

  remove(key: string, path = '/') {
    Cookies.remove(key, { path });
  },
};
