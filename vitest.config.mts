import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { src: path.resolve('src') },
  },
  test: {
    environment: 'jsdom',
    environmentOptions: { jsdom: { url: 'http://localhost:3000' } },
    // Same origin as the page above. A cross-origin API makes jsdom send CORS preflight requests the mock API can't answer.
    env: { NEXT_PUBLIC_API_URL: 'http://localhost:3000/api' },
    setupFiles: ['./src/test/setup.ts'],
  },
});
