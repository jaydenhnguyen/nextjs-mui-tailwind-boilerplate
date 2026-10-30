import { Control, FieldPath, FieldValues, get, useFormState } from 'react-hook-form';
import { FormHelperText } from '@mui/material';
import { FieldMessage } from '../FieldMessage';
import { MessageSpaceProps } from '../types';

type Props<T extends FieldValues, TContext, TOut> = MessageSpaceProps & {
  control: Control<T, TContext, TOut>;
  /** A field path, or `root` / `root.<key>` for errors that don't belong to one field (like a server error). */
  name: FieldPath<T> | 'root' | `root.${string}`;
  className?: string;
};

export function ControlErrorMessage<T extends FieldValues, TContext, TOut>({
  control,
  name,
  className,
  reserveMessageSpace,
}: Props<T, TContext, TOut>) {
  const { errors } = useFormState({ control });
  const error: { message?: unknown } | undefined = get(errors, name);
  const message = typeof error?.message === 'string' ? error.message : undefined;

  return (
    <FormHelperText error role="alert" className={className}>
      <FieldMessage message={message} reserveSpace={reserveMessageSpace} />
    </FormHelperText>
  );
}
