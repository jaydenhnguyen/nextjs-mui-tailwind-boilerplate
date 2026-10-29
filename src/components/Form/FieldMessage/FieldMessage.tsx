import * as React from 'react';
import clsx from 'clsx';
import classes from './FieldMessage.module.scss';

type Props = {
  message?: React.ReactNode;
  reserveSpace?: boolean;
};

export function FieldMessage({ message, reserveSpace = true }: Props) {
  // Keep the last message around while it fades out, otherwise the text would vanish instantly.
  const [lastMessage, setLastMessage] = React.useState(message);
  if (message && message !== lastMessage) setLastMessage(message);

  const isVisible = !!message;

  return (
    <span
      className={clsx(reserveSpace ? classes['reserved'] : classes['collapsible'], isVisible && classes['visible'])}
    >
      <span
        className={classes['text']}
        onTransitionEnd={(event) => {
          if (!isVisible && event.propertyName === 'opacity') setLastMessage(undefined);
        }}
      >
        {isVisible ? message : lastMessage}
      </span>
    </span>
  );
}
