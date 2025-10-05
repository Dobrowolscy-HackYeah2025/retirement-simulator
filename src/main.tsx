import { lazy, StrictMode, Suspense } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';

import { App } from './App';
import './index.css';

const queryClient = new QueryClient();

// Lazy load PostHog to avoid blocking initial render
const PostHogProviderLazy = lazy(async () => {
  const { PostHogProvider } = await import('posthog-js/react');
  const { environment } = await import('./lib/environment');

  return {
    default: ({ children }: { children: React.ReactNode }) => (
      <PostHogProvider
        apiKey={environment.POSTHOG_KEY}
        options={{
          api_host: environment.POSTHOG_HOST,
          defaults: '2025-05-24',
          capture_exceptions: true,
          debug: import.meta.env.MODE === 'development',
        }}
      >
        {children}
      </PostHogProvider>
    ),
  };
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<App />}>
        <PostHogProviderLazy>
          <App />
        </PostHogProviderLazy>
      </Suspense>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  </StrictMode>
);
