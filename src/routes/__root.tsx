import { Button } from '@/components/ui/button';

import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="p-2 flex gap-2 text-lg">
        <Link to="/" className="[&.active]:font-bold">
          <Button variant="ghost">Home</Button>
        </Link>{' '}
        <Link to="/about" className="[&.active]:font-bold">
          <Button variant="ghost">About</Button>
        </Link>
      </div>
      <hr />
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});
