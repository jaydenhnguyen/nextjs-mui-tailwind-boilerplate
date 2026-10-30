import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { StatusCodes } from 'http-status-codes';
import { ApiError, toApiError } from 'src/shared/utils/apiError';
import { notify } from 'src/shared/utils/notify';
import { reportError } from 'src/shared/utils/telemetry';

const MAX_RETRIES = 2;

// A 4xx would just fail the same way again, so only temporary failures are retried.
function shouldRetry(failureCount: number, error: unknown) {
  const apiError = toApiError(error);
  const isTemporary = apiError.kind === 'network' || apiError.kind === 'timeout' || apiError.isServerError;
  return isTemporary && failureCount < MAX_RETRIES;
}

// 401 is handled by the session-expired flow and a canceled request isn't a real failure, so neither gets a toast.
function shouldToast(error: ApiError) {
  return error.kind !== 'canceled' && error.status !== StatusCodes.UNAUTHORIZED;
}

// 4xx responses are normal app behavior; only server failures and unexpected errors point at a real problem.
function shouldReport(error: ApiError) {
  return error.isServerError || error.kind === 'unknown';
}

export function createQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        const apiError = toApiError(error);
        if (shouldReport(apiError)) reportError(apiError, { queryKey: query.queryKey });
        // A failed first load is shown by the page itself, so only failed background refetches get a toast.
        if (query.meta?.silent || query.state.data === undefined || !shouldToast(apiError)) return;
        notify.error(apiError.message);
      },
    }),
    mutationCache: new MutationCache({
      onSuccess: (_data, _variables, _context, mutation) => {
        const message = mutation.meta?.successMessage;
        if (message) notify.success(message);
      },
      onError: (error, _variables, _context, mutation) => {
        const apiError = toApiError(error);
        if (shouldReport(apiError)) reportError(apiError, { mutationKey: mutation.options.mutationKey });
        if (mutation.meta?.silent || !shouldToast(apiError)) return;
        notify.error(apiError.message);
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: shouldRetry,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
