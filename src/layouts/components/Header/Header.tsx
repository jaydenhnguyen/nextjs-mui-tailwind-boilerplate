import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import clsx from 'clsx';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import MenuOutlined from '@mui/icons-material/MenuOutlined';
import { Button, Drawer, IconButton, List, ListItemButton, ListItemText } from '@mui/material';
import { ThemeModeToggle } from 'src/components/ThemeModeToggle';
import { NavItem, siteConfig } from 'src/configs';
import classes from './Header.module.scss';

type Props = {
  navItems: NavItem[];
  homeHref: string;
  actions?: React.ReactNode;
};

const linkProps = (item: NavItem) =>
  item.external
    ? { component: 'a', href: item.href, target: '_blank', rel: 'noopener noreferrer' }
    : { component: Link, href: item.href };

export function Header({ navItems, homeHref, actions }: Props) {
  const { asPath } = useRouter();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const drawerId = React.useId();

  const currentPath = asPath.split(/[?#]/)[0];
  const isActive = (item: NavItem) =>
    !item.external && (currentPath === item.href || currentPath?.startsWith(`${item.href}/`));

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className={classes['root']}>
      <div className={classes['inner']}>
        <Link href={homeHref} className={classes['brand']}>
          {siteConfig.name}
        </Link>

        {navItems.length > 0 && (
          <nav aria-label="Main" className={classes['desktop-nav']}>
            {navItems.map((item) => (
              <Button
                key={item.href}
                {...linkProps(item)}
                color="inherit"
                aria-current={isActive(item) ? 'page' : undefined}
                className={clsx(classes['nav-link'], isActive(item) && classes['active'])}
              >
                {item.label}
              </Button>
            ))}
          </nav>
        )}

        <div className={classes['actions']}>
          {actions}
          <ThemeModeToggle />
          {navItems.length > 0 && (
            <IconButton
              color="inherit"
              aria-label="Open menu"
              aria-expanded={isMenuOpen}
              aria-controls={drawerId}
              onClick={() => setIsMenuOpen(true)}
              className={classes['menu-button']}
            >
              <MenuOutlined />
            </IconButton>
          )}
        </div>
      </div>

      <Drawer id={drawerId} anchor="right" open={isMenuOpen} onClose={closeMenu}>
        <div className={classes['drawer']}>
          <div className={classes['drawer-header']}>
            <IconButton aria-label="Close menu" onClick={closeMenu}>
              <CloseOutlined />
            </IconButton>
          </div>
          <nav aria-label="Main">
            <List>
              {navItems.map((item) => (
                <ListItemButton
                  key={item.href}
                  {...linkProps(item)}
                  selected={isActive(item)}
                  aria-current={isActive(item) ? 'page' : undefined}
                  onClick={closeMenu}
                >
                  <ListItemText primary={item.label} />
                </ListItemButton>
              ))}
            </List>
          </nav>
        </div>
      </Drawer>
    </header>
  );
}
