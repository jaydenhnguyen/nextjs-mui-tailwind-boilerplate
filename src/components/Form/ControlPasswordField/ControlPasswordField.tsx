import * as React from 'react';
import { IconButton, InputAdornment } from '@mui/material';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlined from '@mui/icons-material/VisibilityOffOutlined';
import { FieldValues } from 'react-hook-form';
import { ControlTextField, ControlTextFieldProps } from '../ControlTextField';

type Props<T extends FieldValues, TOut = T> = Omit<ControlTextFieldProps<T, TOut>, 'type'>;

export function ControlPasswordField<T extends FieldValues, TOut = T>({
  autoComplete = 'current-password',
  slotProps,
  ...props
}: Props<T, TOut>) {
  const [isVisible, setIsVisible] = React.useState(false);

  const inputSlotProps = typeof slotProps?.input === 'object' ? slotProps.input : {};

  return (
    <ControlTextField
      {...props}
      type={isVisible ? 'text' : 'password'}
      autoComplete={autoComplete}
      slotProps={{
        ...slotProps,
        input: {
          ...inputSlotProps,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                edge="end"
                aria-label={isVisible ? 'Hide password' : 'Show password'}
                onClick={() => setIsVisible((visible) => !visible)}
              >
                {isVisible ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
