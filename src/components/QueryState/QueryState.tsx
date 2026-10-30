import * as React from 'react';
import { UseQueryResult } from '@tanstack/react-query';
import { ApiError, toApiError } from 'src/shared/utils/apiError';
import { LoadingState } from '../LoadingState';
import { ErrorState } from '../ErrorState';
import { EmptyState } from '../EmptyState';
import { FadeIn } from '../Motion';

type Props<TData> = {
  query: Pick<UseQueryResult<TData, ApiError>, 'data' | 'error' | 'isPending' | 'isError' | 'refetch'>;
  children: (data: TData) => React.ReactNode;
  isEmpty?: (data: TData) => boolean;
  loading?: React.ReactNode;
  empty?: React.ReactNode;
  error?: (error: ApiError, retry: () => void) => React.ReactNode;
};

export function QueryState<TData>({ query, children, isEmpty, loading, empty, error: renderError }: Props<TData>) {
  const retry = () => void query.refetch();

  if (query.isPending) return loading ?? <LoadingState />;

  if (query.isError) {
    const error = toApiError(query.error);
    return renderError?.(error, retry) ?? <ErrorState error={error} onRetry={retry} />;
  }

  const data = query.data as TData;
  if (isEmpty?.(data)) return empty ?? <EmptyState title="Nothing here yet" />;

  return <FadeIn>{children(data)}</FadeIn>;
}
