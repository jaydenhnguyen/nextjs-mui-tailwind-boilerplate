import * as React from 'react';
import { Box } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormHelperText from '@mui/material/FormHelperText';
import InputAdornment from '@mui/material/InputAdornment';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { NumberField as BaseNumberField } from '@base-ui-components/react/number-field';
import classes from './MUINumberField.module.scss';

/**
 * This component is a placeholder for FormControl to correctly set the shrink label state on SSR.
 */
function SSRInitialFilled(_: BaseNumberField.Root.Props) {
  return null;
}

SSRInitialFilled.muiName = 'Input';

export function MUINumberField({
  id: idProp,
  label,
  error,
  size = 'medium',
  helpText,
  prefix,
  ...other
}: BaseNumberField.Root.Props & {
  label?: React.ReactNode;
  size?: 'small' | 'medium';
  error?: boolean;
  helpText?: string;
  prefix?: React.ReactNode;
}) {
  let id = React.useId();
  if (idProp) {
    id = idProp;
  }
  return (
    <BaseNumberField.Root
      allowWheelScrub
      {...other}
      render={(props, state) => (
        <FormControl
          size={size}
          ref={props.ref}
          disabled={state.disabled}
          required={state.required}
          error={error}
          variant="outlined"
          className={'w-full'}
        >
          {props.children}
        </FormControl>
      )}
    >
      <SSRInitialFilled {...other} />
      <InputLabel htmlFor={id}>{label}</InputLabel>
      <BaseNumberField.Input
        id={id}
        render={(props, state) => (
          <OutlinedInput
            label={label}
            inputRef={props.ref}
            value={state.inputValue}
            onBlur={props.onBlur}
            onChange={props.onChange}
            onKeyUp={props.onKeyUp}
            onKeyDown={props.onKeyDown}
            onFocus={props.onFocus}
            slotProps={{
              input: props,
            }}
            endAdornment={
              <InputAdornment
                position="end"
                sx={{
                  flexDirection: 'column',
                  maxHeight: 'unset',
                  alignSelf: 'stretch',
                  borderLeft: '1px solid',
                  borderColor: 'divider',
                  ml: 0,
                  '& button': {
                    py: 0,
                    flex: 1,
                    borderRadius: 0.5,
                  },
                }}
              >
                <BaseNumberField.Increment render={<IconButton size={size} aria-label="Increase" />}>
                  <KeyboardArrowUpIcon fontSize={size} sx={{ transform: 'translateY(2px)' }} />
                </BaseNumberField.Increment>

                <BaseNumberField.Decrement render={<IconButton size={size} aria-label="Decrease" />}>
                  <KeyboardArrowDownIcon fontSize={size} sx={{ transform: 'translateY(-2px)' }} />
                </BaseNumberField.Decrement>
              </InputAdornment>
            }
            startAdornment={prefix ? <Box className={classes['prefix-box-wrapper']}>{prefix}</Box> : null}
            sx={{ pr: 0 }}
            className={classes['wrapper']}
          />
        )}
      />
      <FormHelperText sx={{ ml: 0, '&:empty': { mt: 0 } }}>{helpText}</FormHelperText>
    </BaseNumberField.Root>
  );
}
