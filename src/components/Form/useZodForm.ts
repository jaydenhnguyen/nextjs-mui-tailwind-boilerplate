import { zodResolver } from '@hookform/resolvers/zod';
import { FieldValues, useForm, UseFormProps } from 'react-hook-form';
import { z } from 'zod';

/**
 * `useForm` with zod validation. Field types come from the schema, so there's no separate form type to keep in sync.
 * `defaultValues` use the schema's input type; `onSubmit` gets the parsed output (z.coerce / .transform() applied).
 * Defaults to `mode: 'onTouched'`. See src/components/Form/README.md.
 */
export function useZodForm<TInput extends FieldValues, TOutput extends FieldValues>(
  schema: z.ZodType<TOutput, TInput>,
  options?: Omit<UseFormProps<TInput, unknown, TOutput>, 'resolver'>,
) {
  return useForm<TInput, unknown, TOutput>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    ...options,
  });
}
