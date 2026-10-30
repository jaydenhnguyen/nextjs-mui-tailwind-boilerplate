import * as React from 'react';

export function useCopyToClipboard(resetAfter = 2000) {
  const [isCopied, setIsCopied] = React.useState(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  React.useEffect(() => () => clearTimeout(timerRef.current), []);

  const copy = React.useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        return false;
      }
      setIsCopied(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setIsCopied(false), resetAfter);
      return true;
    },
    [resetAfter],
  );

  return { copy, isCopied };
}
