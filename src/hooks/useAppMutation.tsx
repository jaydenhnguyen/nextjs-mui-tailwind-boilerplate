import { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';

type AppMutationOptions<TData, TVariables = void> =
  Omit<UseMutationOptions<TData, AxiosError, TVariables>, 'mutationFn'>;

/**
 * App-wide wrapper for Tan-stack React Query useMutation
 * Provides centralized error handling and optional success/error callbacks
 *
 * @param mutationFn - async function performing the mutation (e.g., API call)
 * @param options - optional overrides for mutation behavior
 */
export function useAppMutation<TData, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: AppMutationOptions<TData, TVariables>,
) {
  return useMutation<TData, AxiosError, TVariables>({
    mutationFn,
    onError: (err, variables, onMutateResult, context) => {
      toast.error((err as any)?.response?.data?.message ?? 'Something went wrong');
      options?.onError?.(err, variables, onMutateResult, context);
    },
    ...options,
  });
}
