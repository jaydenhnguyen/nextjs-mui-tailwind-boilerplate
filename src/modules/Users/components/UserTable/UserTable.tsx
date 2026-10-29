import {
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Can, PERMISSIONS } from 'src/modules/Authentication';
import { formatDate } from 'src/shared/utils';
import { ROLE_LABELS } from '../../constants';
import { User } from '../../models';
import { DeleteUserButton } from '../DeleteUserButton';
import classes from './UserTable.module.scss';

export function UserTable({ users }: { users: User[] }) {
  return (
    <TableContainer className={classes['container']}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Role</TableCell>
            <TableCell className={classes['optional']}>Joined</TableCell>
            <Can permission={PERMISSIONS.USERS_WRITE}>
              <TableCell align="right">
                <span className="sr-only">Actions</span>
              </TableCell>
            </Can>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} hover>
              <TableCell>
                <div className={classes['person']}>
                  <Avatar src={user.avatarUrl} className={classes['avatar']}>
                    {user.firstName.charAt(0)}
                  </Avatar>
                  <div className={classes['person-text']}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {user.firstName} {user.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {user.email}
                    </Typography>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className={classes['roles']}>
                  {user.roles.map((role) => (
                    <Chip key={role} label={ROLE_LABELS[role]} size="small" variant="outlined" />
                  ))}
                </div>
              </TableCell>
              <TableCell className={classes['optional']}>{formatDate(user.createdAt)}</TableCell>
              <Can permission={PERMISSIONS.USERS_WRITE}>
                <TableCell align="right">
                  <DeleteUserButton user={user} />
                </TableCell>
              </Can>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
