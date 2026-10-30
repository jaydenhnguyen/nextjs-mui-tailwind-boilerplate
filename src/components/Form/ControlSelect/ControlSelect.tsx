import { FieldValues, useController } from 'react-hook-form';
import { MenuItem, TextField, TextFieldProps } from '@mui/material';
import { FieldMessage } from '../FieldMessage';
import { ControlFieldProps, FieldOption, MessageSpaceProps } from '../types';

type Props<T extends FieldValues, TOut = T> = ControlFieldProps<T, TOut> &
  MessageSpaceProps &
  Omit<
    TextFieldProps,
    'name' | 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'inputRef' | 'error' | 'select' | 'children'
  > & {
    options: FieldOption[];
    /** The value becomes an array, so use `[]` as its default value. */
    multiple?: boolean;
    /** Adds a first option with value `''`, e.g. "None" or "All". Single select only. */
    emptyOptionLabel?: string;
  };

export function ControlSelect<T extends FieldValues, TOut = T>({
  control,
  name,
  options,
  multiple = false,
  emptyOptionLabel,
  helperText,
  reserveMessageSpace,
  slotProps,
  ...props
}: Props<T, TOut>) {
  const {
    field,
    fieldState: { error },
  } = useController({ control, name });

  const selectSlotProps = typeof slotProps?.select === 'object' ? slotProps.select : {};

  return (
    <TextField
      {...props}
      select
      name={field.name}
      value={field.value ?? (multiple ? [] : '')}
      onChange={field.onChange}
      onBlur={field.onBlur}
      inputRef={field.ref}
      error={!!error}
      helperText={<FieldMessage message={error?.message ?? helperText} reserveSpace={reserveMessageSpace} />}
      slotProps={{ ...slotProps, select: { ...selectSlotProps, multiple } }}
    >
      {emptyOptionLabel !== undefined && !multiple && (
        <MenuItem value="">
          <em>{emptyOptionLabel}</em>
        </MenuItem>
      )}
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
