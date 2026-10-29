import * as React from 'react';

export function useOpenState(initialOpen = false) {
  const [isOpen, setIsOpen] = React.useState(initialOpen);

  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);
  const toggle = React.useCallback(() => setIsOpen((current) => !current), []);

  return { isOpen, open, close, toggle };
}
