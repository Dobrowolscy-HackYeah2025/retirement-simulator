# Jotai + TanStack Query Integration

This project now includes full integration between Jotai and TanStack Query for powerful state management.

## Installed Packages

- ✅ `jotai` (^2.15.0) - Atomic state management
- ✅ `@tanstack/react-query` (^5.90.2) - Server state management
- ✅ `jotai-tanstack-query` (^0.11.0) - Official integration package

## Key Features

### 1. Query Atoms (`atomWithQuery`)

Create atoms that automatically manage TanStack Query state:

```typescript
import { atomWithQuery } from 'jotai-tanstack-query';

export const dataAtom = atomWithQuery(() => ({
  queryKey: ['data'],
  queryFn: async () => {
    const response = await fetch('/api/data');
    return response.json();
  },
}));
```

### 2. Dynamic Query Atoms

Create queries that depend on other atoms:

```typescript
export const userDataAtom = atomWithQuery((get) => {
  const userId = get(userIdAtom);

  return {
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  };
});
```

### 3. Derived Atoms

Combine query results with computed values:

```typescript
export const calculatedAtom = atom((get) => {
  const queryResult = get(dataAtom);

  if (queryResult.isLoading || queryResult.error) {
    return null;
  }

  return performCalculation(queryResult.data);
});
```

## Usage in Components

```typescript
import { useAtom, useAtomValue } from 'jotai';

function MyComponent() {
  // Read-only access to query atom
  const data = useAtomValue(dataAtom);

  // Read-write access to regular atom
  const [preferences, setPreferences] = useAtom(preferencesAtom);

  // Query atoms provide: data, isLoading, error, etc.
  if (data.isLoading) return <div>Loading...</div>;
  if (data.error) return <div>Error: {data.error.message}</div>;

  return <div>{data.data.title}</div>;
}
```

## Benefits

1. **Automatic Caching** - TanStack Query handles caching and background updates
2. **Reactive Dependencies** - Queries automatically re-run when dependent atoms change
3. **Optimistic Updates** - Easy to implement with Jotai's atomic updates
4. **DevTools Support** - Both Jotai and TanStack Query devtools work together
5. **Type Safety** - Full TypeScript support throughout

## Example Implementation

Check out `/src/lib/atoms.ts` and `/src/components/JotaiQueryExample.tsx` for complete working examples including:

- Simple counter atoms
- User preference management
- Query atoms with automatic data fetching
- Dynamic queries that depend on other atoms
- Derived calculations from query results

## Best Practices

1. **Separate Concerns**: Use Jotai for client state, TanStack Query for server state
2. **Atomic Design**: Keep atoms focused and composable
3. **Error Handling**: Always handle loading and error states in query atoms
4. **Invalidation**: Use query invalidation for real-time updates
5. **Optimistic Updates**: Leverage Jotai's atomic updates for immediate UI feedback

Visit the home page to see the integration in action!
