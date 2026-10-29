import { DefaultError, useMutation, UseMutationOptions } from '@tanstack/react-query';

export function useAppMutation<TData = unknown, TVariables = void, TContext = unknown>(
  options: UseMutationOptions<TData, DefaultError, TVariables, TContext>,
) {
  return useMutation(options);
}
