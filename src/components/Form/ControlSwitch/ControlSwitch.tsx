import { Switch, SwitchProps } from '@mui/material';
import { FieldValues } from 'react-hook-form';
import { ControlBooleanField, ControlBooleanFieldProps } from '../ControlBooleanField';

type Props<T extends FieldValues, TOut = T> = ControlBooleanFieldProps<T, TOut> & {
  /** Props for the MUI `Switch` itself, e.g. `color`, `size`. */
  switchProps?: Omit<SwitchProps, 'name' | 'checked' | 'defaultChecked' | 'onChange' | 'onBlur' | 'inputRef'>;
};

export function ControlSwitch<T extends FieldValues, TOut = T>({ switchProps, ...props }: Props<T, TOut>) {
  const inputSlotProps = typeof switchProps?.slotProps?.input === 'object' ? switchProps.slotProps.input : {};

  return (
    <ControlBooleanField
      {...props}
      renderInput={({ ariaProps, ...input }) => (
        <Switch
          {...switchProps}
          {...input}
          slotProps={{ ...switchProps?.slotProps, input: { ...inputSlotProps, ...ariaProps } }}
        />
      )}
    />
  );
}
