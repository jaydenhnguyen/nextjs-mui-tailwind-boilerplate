import * as React from 'react';
import { FieldValues, UseControllerProps } from 'react-hook-form';

type ControllerProps<T extends FieldValues, TOut> = UseControllerProps<T, UseControllerProps<T>['name'], TOut>;

export type ControlFieldProps<T extends FieldValues, TOut = T> = Pick<ControllerProps<T, TOut>, 'name'> &
  Required<Pick<ControllerProps<T, TOut>, 'control'>>;

export type MessageSpaceProps = {
  /**
   * Keeps one empty line under the field so an error never pushes content down. On by default.
   * Turn it off for dense layouts (search boxes, filter bars, table cells): the message then grows in smoothly instead.
   */
  reserveMessageSpace?: boolean;
};

export type FieldOption<V extends string | number = string | number> = {
  label: React.ReactNode;
  /** The form gets this exact value back, numbers stay numbers. */
  value: V;
  disabled?: boolean;
};
