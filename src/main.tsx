import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  RouterProvider,
  createRouter,
  createHashHistory,
} from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './index.css';

// Import the generated route tree
import { routeTree } from './routeTree.gen';

// Create a new router instance with hash-based routing for SPA
const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  // Use hash-based routing for SPA deployment
  history: createHashHistory(),
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Create a client for TanStack Query
const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
);
