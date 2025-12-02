import * as React from 'react';
import { useController, FieldValues, Control, Path } from 'react-hook-form';
import { MUINumberField } from './components';
import { Box } from '@mui/material';
import { NumberField as BaseNumberField } from '@base-ui-components/react/number-field';

export type ControlledNumberFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  rules?: any;
  containerClass?: string;
  label: React.ReactNode;
  size?: 'small' | 'medium';
  prefix?: string;
} & Omit<BaseNumberField.Root.Props, 'prefix'>;

export function ControlledNumberField<T extends FieldValues>({
  control,
  name,
  rules,
  containerClass = '',
  label,
  size = 'medium',
  prefix,
  ...props
}: ControlledNumberFieldProps<T>): React.ReactElement {
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
      <MUINumberField
        label={label}
        size={size}
        value={value}
        onBlur={onBlur}
        onValueChange={onChange}
        inputRef={ref}
        prefix={prefix}
        {...props}
      />
      {error && <p style={{ color: 'red' }}>{error.message}</p>}
    </Box>
  );
}
