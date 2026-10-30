type Properties = Record<string, unknown>;

const isDev = process.env.NODE_ENV === 'development';

// The one place to plug in an error tracker (Sentry, etc.). Render crashes and failed API calls already call it.
export function reportError(error: unknown, context?: Properties) {
  if (isDev) console.error('[reportError]', error, context ?? '');
}

// The one place to plug in analytics (PostHog, Google Analytics, etc.).
export function track(event: string, properties?: Properties) {
  // eslint-disable-next-line no-console
  if (isDev) console.info('[track]', event, properties ?? '');
}
