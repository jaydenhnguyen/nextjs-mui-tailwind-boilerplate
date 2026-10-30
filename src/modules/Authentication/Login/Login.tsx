import * as React from 'react';
import { useRouter } from 'next/router';
import { StatusCodes } from 'http-status-codes';
import { Button, Paper, Typography } from '@mui/material';
import { ControlErrorMessage, ControlPasswordField, ControlTextField, Form } from 'src/components/Form';
import { LoadingState } from 'src/components/LoadingState';
import { APP_ROUTES } from 'src/shared/constants';
import { applyApiErrorToForm } from 'src/shared/utils/apiError';
import { useAuth, useLogin, useLoginForm } from '../hooks';
import { LoginRequest } from '../models';
import { getSafeRedirect } from '../utils/session';
import classes from './Login.module.scss';

export function Login() {
  const router = useRouter();
  const { isAuthenticated, isChecking } = useAuth();
  const form = useLoginForm();
  const { control, setError } = form;
  const { mutate: login, isPending } = useLogin();

  const redirectTo = getSafeRedirect(router.query['redirect'], APP_ROUTES.HOME);

  React.useEffect(() => {
    if (isAuthenticated) void router.replace(redirectTo);
  }, [isAuthenticated, redirectTo, router]);

  const handleSubmit = (values: LoginRequest) =>
    login(values, {
      onError: (error) => {
        if (error.status === StatusCodes.UNAUTHORIZED) {
          setError('root.server', { message: 'Incorrect email or password' });
          return;
        }
        applyApiErrorToForm(setError, error);
      },
    });

  if (isChecking || isAuthenticated) return <LoadingState />;

  return (
    <div className={classes['root']}>
      <Paper variant="outlined" className={classes['card']}>
        <div className={classes['heading']}>
          <Typography variant="h4" component="h1">
            Sign in
          </Typography>
          <Typography color="text.secondary">Welcome back. Enter your details to continue.</Typography>
        </div>

        <Form form={form} onSubmit={handleSubmit} className={classes['form']}>
          <ControlTextField control={control} name="email" label="Email" type="email" autoComplete="email" fullWidth />
          <ControlPasswordField control={control} name="password" label="Password" fullWidth />
          <ControlErrorMessage control={control} name="root.server" />
          <Button type="submit" variant="contained" size="large" loading={isPending} fullWidth>
            Sign in
          </Button>
        </Form>
      </Paper>
    </div>
  );
}
