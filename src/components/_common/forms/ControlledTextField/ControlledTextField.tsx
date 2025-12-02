import * as React from 'react';
import { Box, TextField, TextFieldProps } from '@mui/material';
import { useController, FieldValues, Control, Path } from 'react-hook-form';

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  rules?: any;
  containerClass?: string;
} & TextFieldProps;

export function ControlledTextField<T extends FieldValues>({
  control,
  name,
  rules,
  containerClass = '',
  ...props
}: Props<T>): React.ReactElement {
  const {
    field: { value, onChange, onBlur, ref },
    fieldState: { error },
  } = useController({
    name,
    control,
    rules,
  });

  return (
    <Box className={containerClass}>
      <TextField
        value={value ?? ''}
        onChange={onChange}
        onBlur={onBlur}
        inputRef={ref}
        fullWidth
        error={!!error}
        helperText={error ? error.message : ''}
        {...props}
      />
    </Box>
  );
}
