import * as React from 'react';
import dynamic from 'next/dynamic';
import { LoadingState } from 'src/components/LoadingState';
import { env } from 'src/configs/env';
import { MockBanner } from './MockBanner/MockBanner';

// ssr: false keeps MSW's browser-only code out of the server build.
const MockServiceWorker = dynamic(() => import('./MockServiceWorker').then((module) => module.MockServiceWorker), {
  ssr: false,
});

// The app waits for the worker before rendering, otherwise its first requests would reach the real network.
export function ApiMockingGate({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = React.useState(false);
  const handleReady = React.useCallback(() => setIsReady(true), []);

  if (!env.API_MOCKING) return <>{children}</>;

  return (
    <>
      {isReady ? children : <LoadingState fullScreen />}
      <MockServiceWorker onReady={handleReady} />
      <MockBanner />
    </>
  );
}
