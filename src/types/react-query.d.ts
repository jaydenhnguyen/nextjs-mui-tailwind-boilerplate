import '@tanstack/react-query';
import type { ApiError } from 'src/shared/utils/apiError';

type AppQueryMeta = Record<string, unknown> & {
  silent?: boolean;
};

type AppMutationMeta = AppQueryMeta & {
  successMessage?: string;
};

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: ApiError;
    queryMeta: AppQueryMeta;
    mutationMeta: AppMutationMeta;
  }
}
