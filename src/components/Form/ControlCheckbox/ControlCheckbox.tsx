import { Checkbox, CheckboxProps } from '@mui/material';
import { FieldValues } from 'react-hook-form';
import { ControlBooleanField, ControlBooleanFieldProps } from '../ControlBooleanField';

type Props<T extends FieldValues, TOut = T> = ControlBooleanFieldProps<T, TOut> & {
  /** Props for the MUI `Checkbox` itself, e.g. `color`, `size`, `icon`. */
  checkboxProps?: Omit<CheckboxProps, 'name' | 'checked' | 'defaultChecked' | 'onChange' | 'onBlur' | 'inputRef'>;
};

export function ControlCheckbox<T extends FieldValues, TOut = T>({ checkboxProps, ...props }: Props<T, TOut>) {
  const inputSlotProps = typeof checkboxProps?.slotProps?.input === 'object' ? checkboxProps.slotProps.input : {};

  return (
    <ControlBooleanField
      {...props}
      renderInput={({ ariaProps, ...input }) => (
        <Checkbox
          {...checkboxProps}
          {...input}
          slotProps={{ ...checkboxProps?.slotProps, input: { ...inputSlotProps, ...ariaProps } }}
        />
      )}
    />
  );
}
