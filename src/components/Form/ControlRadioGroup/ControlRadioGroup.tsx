import * as React from 'react';
import {
  FormControl,
  FormControlLabel,
  FormControlLabelProps,
  FormControlProps,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  RadioGroupProps,
  RadioProps,
} from '@mui/material';
import { FieldValues, useController } from 'react-hook-form';
import { FieldMessage } from '../FieldMessage';
import { ControlFieldProps, FieldOption, MessageSpaceProps } from '../types';

type Props<T extends FieldValues, TOut = T> = ControlFieldProps<T, TOut> &
  MessageSpaceProps & {
    options: FieldOption[];
    /** Rendered as the group's `<legend>`. */
    label?: React.ReactNode;
    helperText?: React.ReactNode;
    row?: boolean;
    disabled?: boolean;
    required?: boolean;
    className?: string;
    /** Props for the MUI `FormControl` wrapper (a `<fieldset>`). */
    formControlProps?: Omit<FormControlProps, 'error' | 'disabled' | 'required' | 'children'>;
    /** Props for the MUI `RadioGroup`. */
    radioGroupProps?: Omit<RadioGroupProps, 'name' | 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'row'>;
    /** Props for every MUI `Radio`, e.g. `color`, `size`. */
    radioProps?: Omit<RadioProps, 'inputRef' | 'value'>;
    /** Props for every option's MUI `FormControlLabel`. */
    formControlLabelProps?: Omit<FormControlLabelProps, 'control' | 'label' | 'value' | 'disabled'>;
  };

export function ControlRadioGroup<T extends FieldValues, TOut = T>({
  control,
  name,
  options,
  label,
  helperText,
  row,
  disabled,
  required,
  className,
  reserveMessageSpace,
  formControlProps,
  radioGroupProps,
  radioProps,
  formControlLabelProps,
}: Props<T, TOut>) {
  const {
    field,
    fieldState: { error },
  } = useController({ control, name });
  const helperId = React.useId();

  // Radio inputs always hand back strings, so look the option up to keep number values as numbers.
  const handleChange = (_event: React.ChangeEvent<HTMLInputElement>, value: string) => {
    const option = options.find((item) => String(item.value) === value);
    field.onChange(option ? option.value : value);
  };

  return (
    <FormControl
      component="fieldset"
      {...formControlProps}
      error={!!error}
      disabled={disabled}
      required={required}
      className={className ?? formControlProps?.className}
    >
      {label && <FormLabel component="legend">{label}</FormLabel>}
      <RadioGroup
        aria-describedby={helperId}
        {...radioGroupProps}
        row={row}
        name={field.name}
        value={field.value ?? ''}
        onChange={handleChange}
        onBlur={field.onBlur}
      >
        {options.map((option, index) => (
          <FormControlLabel
            {...formControlLabelProps}
            key={option.value}
            value={option.value}
            label={option.label}
            disabled={option.disabled}
            control={<Radio {...radioProps} inputRef={index === 0 ? field.ref : undefined} />}
          />
        ))}
      </RadioGroup>
      <FormHelperText id={helperId}>
        <FieldMessage message={error?.message ?? helperText} reserveSpace={reserveMessageSpace} />
      </FormHelperText>
    </FormControl>
  );
}
