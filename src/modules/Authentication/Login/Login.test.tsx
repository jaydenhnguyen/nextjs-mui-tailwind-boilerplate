import { screen, waitFor } from '@testing-library/react';
import mockRouter from 'next-router-mock';
import { describe, expect, it } from 'vitest';
import { MOCK_ACCOUNTS, MOCK_PASSWORD } from 'src/mocks/db';
import { renderWithProviders } from 'src/test';
import { Login } from './Login';

describe('Login', () => {
  it('shows field errors without calling the API', async () => {
    const { user } = renderWithProviders(<Login />);

    await user.click(await screen.findByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument();
    expect(screen.getByText('Enter your password')).toBeInTheDocument();
  });

  it('shows a message when the password is wrong', async () => {
    const { user } = renderWithProviders(<Login />);

    await user.type(await screen.findByLabelText('Email'), MOCK_ACCOUNTS.ADMIN);
    await user.type(screen.getByLabelText('Password'), 'wrong-password');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Incorrect email or password')).toBeInTheDocument();
  });

  it('signs in and goes back to the page that asked for it', async () => {
    mockRouter.setCurrentUrl('/login?redirect=/users');
    const { user } = renderWithProviders(<Login />);

    await user.type(await screen.findByLabelText('Email'), MOCK_ACCOUNTS.ADMIN);
    await user.type(screen.getByLabelText('Password'), MOCK_PASSWORD);
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => expect(mockRouter).toMatchObject({ asPath: '/users' }));
  });
});
