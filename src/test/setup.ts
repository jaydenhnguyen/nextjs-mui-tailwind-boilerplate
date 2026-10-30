import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { MotionGlobalConfig } from 'motion/react';
import mockRouter from 'next-router-mock';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { tokenManager } from 'src/configs/auth';
import { setupZod } from 'src/configs/zod';
import { server } from './server';

vi.mock('next/router', () => import('next-router-mock'));

setupZod();

// Animations finish instantly, so tests never wait on an enter or exit transition.
MotionGlobalConfig.skipAnimations = true;

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));

afterEach(() => {
  cleanup();
  server.resetHandlers();
  tokenManager.removeAllCredentials();
  localStorage.clear();
  mockRouter.setCurrentUrl('/');
});

afterAll(() => server.close());
