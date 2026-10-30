import Link from 'next/link';
import { Typography } from '@mui/material';
import { navigationConfig, siteConfig } from 'src/configs';
import classes from './Footer.module.scss';

export function Footer() {
  const links = [...navigationConfig.footer, ...siteConfig.socials.map((social) => ({ ...social, external: true }))];

  return (
    <footer className={classes['root']}>
      <div className={classes['inner']}>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} {siteConfig.author.name || siteConfig.name}
        </Typography>

        {links.length > 0 && (
          <nav aria-label="Footer" className={classes['links']}>
            {links.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={classes['link']}
                >
                  {link.label}
                </a>
              ) : (
                <Link key={link.href} href={link.href} className={classes['link']}>
                  {link.label}
                </Link>
              ),
            )}
          </nav>
        )}
      </div>
    </footer>
  );
}
