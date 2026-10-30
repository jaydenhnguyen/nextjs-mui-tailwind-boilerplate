import * as React from 'react';
import { m } from 'motion/react';
import AddOutlined from '@mui/icons-material/AddOutlined';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import { Button, InputAdornment, Pagination, TextField, Typography } from '@mui/material';
import { EmptyState } from 'src/components/EmptyState';
import { QueryState } from 'src/components/QueryState';
import { useDebounce, useOpenState, useQueryParams } from 'src/hooks';
import { Can, PERMISSIONS } from 'src/modules/Authentication';
import { formatNumber } from 'src/shared/utils';
import { moveTransition } from 'src/theme/motion';
import { CreateUserDialog, UserTable } from './components';
import { USER_LIST_PAGE_SIZE } from './constants';
import { useGetUserList } from './hooks';
import classes from './Users.module.scss';

export function Users() {
  const { params, setParams, isReady } = useQueryParams<'search' | 'page'>();
  const createDialog = useOpenState();

  // null until the user types, so the box shows whatever search is already in the URL.
  const [searchInput, setSearchInput] = React.useState<string | null>(null);
  const debouncedSearch = useDebounce(searchInput);

  React.useEffect(() => {
    if (debouncedSearch !== null) void setParams({ search: debouncedSearch, page: undefined });
  }, [debouncedSearch, setParams]);

  const page = Math.max(1, Number(params.page) || 1);
  const usersQuery = useGetUserList(
    { page, pageSize: USER_LIST_PAGE_SIZE, search: params.search },
    { enabled: isReady },
  );
  const total = usersQuery.data?.total ?? 0;
  const pageCount = Math.ceil(total / USER_LIST_PAGE_SIZE);

  const newUserButton = (
    <Can permission={PERMISSIONS.USERS_WRITE}>
      <Button variant="contained" startIcon={<AddOutlined />} onClick={createDialog.open}>
        New user
      </Button>
    </Can>
  );

  return (
    <div className={classes['root']}>
      <div className={classes['header']}>
        <div>
          <Typography variant="h4" component="h1">
            Users
          </Typography>
          <Typography color="text.secondary">
            {usersQuery.data
              ? `${formatNumber(total)} ${total === 1 ? 'person' : 'people'}`
              : 'Everyone with access to the app'}
          </Typography>
        </div>
        {newUserButton}
      </div>

      <TextField
        value={searchInput ?? params.search ?? ''}
        onChange={(event) => setSearchInput(event.target.value)}
        placeholder="Search by name or email"
        size="small"
        className={classes['search']}
        slotProps={{
          htmlInput: { 'aria-label': 'Search users' },
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />

      <QueryState
        query={usersQuery}
        isEmpty={(response) => response.data.length === 0}
        empty={
          params.search ? (
            <EmptyState title="No matches" description={`Nobody matches "${params.search}".`} />
          ) : (
            <EmptyState title="No users yet" action={newUserButton} />
          )
        }
      >
        {(response) => (
          // Dims the current page while the next one loads, instead of flashing a spinner.
          <m.div
            initial={false}
            animate={{ opacity: usersQuery.isPlaceholderData ? 0.6 : 1 }}
            transition={moveTransition()}
            className={classes['results']}
          >
            <UserTable users={response.data} />
            {pageCount > 1 && (
              <Pagination
                page={page}
                count={pageCount}
                onChange={(_event, nextPage) => void setParams({ page: nextPage === 1 ? undefined : nextPage })}
                className={classes['pagination']}
              />
            )}
          </m.div>
        )}
      </QueryState>

      <CreateUserDialog open={createDialog.isOpen} onClose={createDialog.close} />
    </div>
  );
}
