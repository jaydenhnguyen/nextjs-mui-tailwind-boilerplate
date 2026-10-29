import { toast, ToastOptions } from 'react-toastify';

// The same message shown twice in a row (e.g. several failed requests) only appears once.
const withId = (message: string, options?: ToastOptions): ToastOptions => ({ toastId: message, ...options });

export const notify = {
  success: (message: string, options?: ToastOptions) => toast.success(message, withId(message, options)),
  error: (message: string, options?: ToastOptions) => toast.error(message, withId(message, options)),
  info: (message: string, options?: ToastOptions) => toast.info(message, withId(message, options)),
  warning: (message: string, options?: ToastOptions) => toast.warning(message, withId(message, options)),
  dismiss: (id?: string) => toast.dismiss(id),
};
