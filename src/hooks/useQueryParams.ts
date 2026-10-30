import * as React from 'react';
import { useRouter } from 'next/router';
import isEqual from 'lodash/isEqual';

type ParamValue = string | number | boolean | null | undefined;

// Keeps UI state like filters, search and page number in the URL, so it survives reloads and can be shared.
export function useQueryParams<TKey extends string = string>() {
  const router = useRouter();

  // The router object changes on every navigation; reading it through a ref keeps setParams stable,
  // so calling it from an effect can't start a navigate → re-render → navigate loop.
  const routerRef = React.useRef(router);
  React.useEffect(() => {
    routerRef.current = router;
  }, [router]);

  const params = React.useMemo(() => {
    const result: Partial<Record<TKey, string>> = {};
    for (const [key, value] of Object.entries(router.query)) {
      const first = Array.isArray(value) ? value[0] : value;
      if (first !== undefined) result[key as TKey] = first;
    }
    return result;
  }, [router.query]);

  const setParams = React.useCallback(
    async (next: Partial<Record<TKey, ParamValue>>, { push = false }: { push?: boolean } = {}) => {
      const current = routerRef.current;
      const query: Record<string, string | string[]> = {};
      for (const [key, value] of Object.entries({ ...current.query, ...next })) {
        if (value === undefined || value === null || value === '') continue;
        query[key] = Array.isArray(value) ? value : String(value);
      }
      if (isEqual(query, current.query)) return true;

      const url = { pathname: current.pathname, query };
      const options = { shallow: true, scroll: false };
      return push ? current.push(url, undefined, options) : current.replace(url, undefined, options);
    },
    [],
  );

  return { params, setParams, isReady: router.isReady };
}
