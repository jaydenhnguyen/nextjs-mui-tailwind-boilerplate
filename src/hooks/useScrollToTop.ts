import { useEffect } from 'react';
import { useRouter } from 'next/router';

export function useScrollToTop() {
  const { pathname } = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
}
