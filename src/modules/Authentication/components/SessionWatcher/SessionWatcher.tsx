import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { onSessionExpired } from 'src/configs/auth';
import { notify } from 'src/shared/utils/notify';
import { AUTH_QUERY_KEYS } from '../../constants';
import { clearSession } from '../../utils/session';

export function SessionWatcher() {
  const queryClient = useQueryClient();

  React.useEffect(() => {
    onSessionExpired(() => {
      // Someone who was never signed in shouldn't be told their session expired.
      const wasSignedIn = !!queryClient.getQueryData(AUTH_QUERY_KEYS.CURRENT_USER);
      clearSession(queryClient);
      if (wasSignedIn) notify.info('Your session has expired, please sign in again');
    });
  }, [queryClient]);

  return null;
}
