import * as React from 'react';
import { Box } from '@mui/material';
import { FieldValues } from 'react-hook-form';
import { CurrencySign, CurrencyType } from 'src/shared/constants';
import { ControlledNumberField, ControlledNumberFieldProps } from '../forms';
import classes from './CurrencyInput.module.scss';

type Props<T extends FieldValues> = {
  currencyType: CurrencyType;
} & Omit<ControlledNumberFieldProps<T>, 'label'>;

export function CurrencyInput<T extends FieldValues>({ currencyType, ...props }: Props<T>): React.ReactElement {
  return (
    <Box className={classes['wrapper']}>
      <ControlledNumberField
        control={props.control}
        name={props.name}
        label="Amount"
        containerClass={classes['number-input']}
        prefix={CurrencySign[currencyType]}
        format={{
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }}
      />
    </Box>
  );
}
