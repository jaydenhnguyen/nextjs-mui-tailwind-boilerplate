import { screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import mockRouter from 'next-router-mock';
import { beforeEach, describe, expect, it } from 'vitest';
import { MOCK_ACCOUNTS } from 'src/mocks/db';
import { apiUrl } from 'src/mocks/session';
import { AUTH_QUERY_KEYS } from 'src/modules/Authentication';
import { renderWithProviders, server, signInAs } from 'src/test';
import { Users } from './Users';

describe('Users', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl('/users');
  });

  it('lists users from the API', async () => {
    signInAs();
    renderWithProviders(<Users />);

    expect(await screen.findByText('24 people')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(11);
  });

  it('searches and keeps the search in the URL', async () => {
    signInAs();
    const { user } = renderWithProviders(<Users />);

    await user.type(await screen.findByLabelText('Search users'), 'viewer');

    expect(await screen.findByText('Vic Viewer')).toBeInTheDocument();
    expect(mockRouter).toMatchObject({ query: { search: 'viewer' } });
  });

  it('shows an empty state when nothing matches', async () => {
    signInAs();
    mockRouter.setCurrentUrl('/users?search=nobody-here');
    renderWithProviders(<Users />);

    expect(await screen.findByText('No matches')).toBeInTheDocument();
  });

  it('shows the error state when the API fails', async () => {
    signInAs();
    server.use(http.get(apiUrl('/users'), () => HttpResponse.json({}, { status: 500 })));
    renderWithProviders(<Users />);

    expect(await screen.findByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('creates a user', async () => {
    signInAs();
    const { user } = renderWithProviders(<Users />);

    await user.click(await screen.findByRole('button', { name: 'New user' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('First name'), 'Test');
    await user.type(within(dialog).getByLabelText('Last name'), 'Person');
    await user.type(within(dialog).getByLabelText('Email'), 'test.person@example.com');
    await user.click(within(dialog).getByRole('button', { name: 'Create user' }));

    expect(await screen.findByText('Test Person')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('hides write actions from people without permission', async () => {
    signInAs(MOCK_ACCOUNTS.VIEWER);
    const { queryClient } = renderWithProviders(<Users />);

    await screen.findByRole('table');
    await waitFor(() => expect(queryClient.getQueryData(AUTH_QUERY_KEYS.CURRENT_USER)).toBeTruthy());

    expect(screen.queryByRole('button', { name: 'New user' })).not.toBeInTheDocument();
  });
});
