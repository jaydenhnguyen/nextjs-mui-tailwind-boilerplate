import * as React from 'react';
import { worker } from './browser';

let startPromise: Promise<unknown> | null = null;

// Started once per page load, even though Strict Mode runs effects twice.
export function MockServiceWorker({ onReady }: { onReady: () => void }) {
  React.useEffect(() => {
    let isActive = true;
    startPromise ??= worker.start({ quiet: true, onUnhandledFrame: 'bypass' });
    void startPromise.then(() => {
      if (isActive) onReady();
    });
    return () => {
      isActive = false;
    };
  }, [onReady]);

  return null;
}
