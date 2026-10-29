import * as React from 'react';
import { FormControl, FormControlLabel, FormControlLabelProps, FormControlProps, FormHelperText } from '@mui/material';
import { FieldValues, useController } from 'react-hook-form';
import { FieldMessage } from './FieldMessage';
import { ControlFieldProps, MessageSpaceProps } from './types';

export type ControlBooleanFieldProps<T extends FieldValues, TOut = T> = ControlFieldProps<T, TOut> &
  MessageSpaceProps & {
    label: React.ReactNode;
    helperText?: React.ReactNode;
    disabled?: boolean;
    required?: boolean;
    className?: string;
    /** Props for the MUI `FormControl` wrapper. */
    formControlProps?: Omit<FormControlProps, 'error' | 'disabled' | 'required' | 'children'>;
    /** Props for the MUI `FormControlLabel` around the input, e.g. `labelPlacement`. */
    formControlLabelProps?: Omit<FormControlLabelProps, 'control' | 'label' | 'required'>;
  };

export type BooleanInputProps = {
  name: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  onBlur: () => void;
  inputRef: React.Ref<HTMLInputElement>;
  ariaProps: { 'aria-invalid': boolean; 'aria-describedby': string };
};

type Props<T extends FieldValues, TOut> = ControlBooleanFieldProps<T, TOut> & {
  renderInput: (input: BooleanInputProps) => React.ReactElement;
};

// Shared by ControlCheckbox and ControlSwitch, they only differ in which MUI input gets rendered.
export function ControlBooleanField<T extends FieldValues, TOut>({
  control,
  name,
  renderInput,
  label,
  helperText,
  disabled,
  required,
  className,
  reserveMessageSpace,
  formControlProps,
  formControlLabelProps,
}: Props<T, TOut>) {
  const {
    field,
    fieldState: { error },
  } = useController({ control, name });
  const helperId = React.useId();

  return (
    <FormControl
      {...formControlProps}
      error={!!error}
      disabled={disabled}
      required={required}
      className={className ?? formControlProps?.className}
    >
      <FormControlLabel
        {...formControlLabelProps}
        label={label}
        required={required}
        control={renderInput({
          name: field.name,
          checked: !!field.value,
          onChange: (_event, checked) => field.onChange(checked),
          onBlur: field.onBlur,
          inputRef: field.ref,
          ariaProps: { 'aria-invalid': !!error, 'aria-describedby': helperId },
        })}
      />
      <FormHelperText id={helperId}>
        <FieldMessage message={error?.message ?? helperText} reserveSpace={reserveMessageSpace} />
      </FormHelperText>
    </FormControl>
  );
}
