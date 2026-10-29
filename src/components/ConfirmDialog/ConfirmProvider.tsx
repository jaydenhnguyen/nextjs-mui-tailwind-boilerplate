import * as React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

export type ConfirmOptions = {
  title: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
};

type Confirm = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = React.createContext<Confirm | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = React.useState<ConfirmOptions | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const resolveRef = React.useRef<((confirmed: boolean) => void) | null>(null);
  const titleId = React.useId();
  const descriptionId = React.useId();

  const confirm = React.useCallback<Confirm>((nextOptions) => {
    resolveRef.current?.(false);
    setOptions(nextOptions);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const close = (confirmed: boolean) => {
    resolveRef.current?.(confirmed);
    resolveRef.current = null;
    setIsOpen(false);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog
        open={isOpen}
        onClose={() => close(false)}
        maxWidth="xs"
        fullWidth
        aria-labelledby={titleId}
        aria-describedby={options?.description ? descriptionId : undefined}
        // Content stays until the close animation ends, so the text doesn't vanish mid-fade.
        slotProps={{ transition: { onExited: () => setOptions(null) } }}
      >
        <DialogTitle id={titleId}>{options?.title}</DialogTitle>
        {options?.description && (
          <DialogContent>
            <DialogContentText id={descriptionId}>{options.description}</DialogContentText>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={() => close(false)} autoFocus={options?.destructive}>
            {options?.cancelText ?? 'Cancel'}
          </Button>
          <Button
            variant="contained"
            color={options?.destructive ? 'error' : 'primary'}
            onClick={() => close(true)}
            autoFocus={!options?.destructive}
          >
            {options?.confirmText ?? 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const confirm = React.useContext(ConfirmContext);
  if (!confirm) throw new Error('useConfirm must be used within ConfirmProvider');
  return confirm;
}
