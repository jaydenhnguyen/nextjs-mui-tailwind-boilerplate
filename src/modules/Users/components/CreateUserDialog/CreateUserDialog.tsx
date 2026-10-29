import * as React from 'react';
import { z } from 'zod';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { ControlErrorMessage, ControlSelect, ControlTextField, Form } from 'src/components/Form';
import { applyApiErrorToForm } from 'src/shared/utils';
import { ROLE_OPTIONS } from '../../constants';
import { useCreateUser, useCreateUserForm } from '../../hooks';
import { createUserSchema } from '../../schema/create-user.schema';
import classes from './CreateUserDialog.module.scss';

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CreateUserDialog({ open, onClose }: Props) {
  const formId = React.useId();
  const titleId = React.useId();
  const form = useCreateUserForm();
  const { control, reset, setError } = form;
  const { mutate: createUser, isPending } = useCreateUser();

  const handleSubmit = ({ role, ...values }: z.output<typeof createUserSchema>) =>
    createUser(
      { ...values, roles: [role] },
      {
        onSuccess: onClose,
        onError: (error) => applyApiErrorToForm(setError, error),
      },
    );

  return (
    <Dialog
      open={open}
      onClose={isPending ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby={titleId}
      slotProps={{ transition: { onExited: () => reset() } }}
    >
      <DialogTitle id={titleId}>New user</DialogTitle>
      <DialogContent>
        <Form id={formId} form={form} onSubmit={handleSubmit} className={classes['form']}>
          <div className={classes['row']}>
            <ControlTextField control={control} name="firstName" label="First name" autoFocus fullWidth />
            <ControlTextField control={control} name="lastName" label="Last name" fullWidth />
          </div>
          <ControlTextField control={control} name="email" label="Email" type="email" fullWidth />
          <ControlSelect control={control} name="role" label="Role" options={ROLE_OPTIONS} fullWidth />
          <ControlErrorMessage control={control} name="root.server" />
        </Form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" form={formId} variant="contained" loading={isPending}>
          Create user
        </Button>
      </DialogActions>
    </Dialog>
  );
}
