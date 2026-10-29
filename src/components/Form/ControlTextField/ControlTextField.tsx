import { TextField, TextFieldProps } from '@mui/material';
import { FieldValues, useController } from 'react-hook-form';
import { FieldMessage } from '../FieldMessage';
import { ControlFieldProps, MessageSpaceProps } from '../types';

export type ControlTextFieldProps<T extends FieldValues, TOut = T> = ControlFieldProps<T, TOut> &
  MessageSpaceProps &
  Omit<TextFieldProps, 'name' | 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'inputRef' | 'error'>;

export function ControlTextField<T extends FieldValues, TOut = T>({
  control,
  name,
  helperText,
  reserveMessageSpace,
  ...props
}: ControlTextFieldProps<T, TOut>) {
  const {
    field,
    fieldState: { error },
  } = useController({ control, name });

  return (
    <TextField
      {...props}
      name={field.name}
      value={field.value ?? ''}
      onChange={field.onChange}
      onBlur={field.onBlur}
      inputRef={field.ref}
      error={!!error}
      helperText={<FieldMessage message={error?.message ?? helperText} reserveSpace={reserveMessageSpace} />}
    />
  );
}
