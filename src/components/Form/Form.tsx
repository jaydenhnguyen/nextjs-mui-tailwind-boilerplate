import * as React from 'react';
import { FieldValues, SubmitErrorHandler, SubmitHandler, UseFormReturn } from 'react-hook-form';

type Props<T extends FieldValues, TContext, TOut> = Omit<React.ComponentProps<'form'>, 'onSubmit'> & {
  /** The object returned by `useZodForm`. */
  form: UseFormReturn<T, TContext, TOut>;
  /** Runs only when validation passes, with the parsed values. */
  onSubmit: SubmitHandler<TOut>;
  /** Runs when validation fails. The first invalid field is already focused. */
  onInvalid?: SubmitErrorHandler<T>;
};

export function Form<T extends FieldValues, TContext, TOut>({
  form,
  onSubmit,
  onInvalid,
  children,
  ...props
}: Props<T, TContext, TOut>) {
  return (
    <form noValidate {...props} onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
      {children}
    </form>
  );
}
