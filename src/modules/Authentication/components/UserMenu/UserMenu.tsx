import * as React from 'react';
import { Avatar, Divider, IconButton, ListItemIcon, Menu, MenuItem, Typography } from '@mui/material';
import LogoutOutlined from '@mui/icons-material/LogoutOutlined';
import { useAuth } from '../../hooks/useAuth';
import { useLogout } from '../../hooks/useLogout';
import classes from './UserMenu.module.scss';

export function UserMenu() {
  const { user } = useAuth();
  const { mutate: logout, isPending } = useLogout();
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
  const menuId = React.useId();

  if (!user) return null;

  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

  return (
    <>
      <IconButton
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={!!anchor}
        aria-controls={anchor ? menuId : undefined}
        onClick={(event) => setAnchor(event.currentTarget)}
        size="small"
      >
        <Avatar src={user.avatarUrl} alt={fullName} className={classes['avatar']}>
          {initials}
        </Avatar>
      </IconButton>

      <Menu
        id={menuId}
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <div className={classes['profile']}>
          <Typography variant="subtitle2">{fullName}</Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
        </div>
        <Divider />
        <MenuItem onClick={() => logout()} disabled={isPending}>
          <ListItemIcon>
            <LogoutOutlined fontSize="small" />
          </ListItemIcon>
          Sign out
        </MenuItem>
      </Menu>
    </>
  );
}
