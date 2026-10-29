import classes from './SkipLink.module.scss';

export const MAIN_CONTENT_ID = 'main-content';

export function SkipLink() {
  return (
    <a href={`#${MAIN_CONTENT_ID}`} className={classes['root']}>
      Skip to content
    </a>
  );
}
