import { QueryClient } from '@tanstack/react-query';

declare global {
  interface Window {
    __QUERY_CLIENT__?: QueryClient;
  }
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchOnMount: true,
        throwOnError: false,
      },
      mutations: {
        retry: 0,
        throwOnError: false,
      },
    },
  });
}

export const queryClient = createQueryClient();

export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
    user: (id: number) => ['auth', 'user', id] as const,
  },
  dashboard: {
    stats: ['dashboard', 'stats'] as const,
    activity: ['dashboard', 'activity'] as const,
  },
  identities: {
    list: (params?: Record<string, unknown>) => ['identities', 'list', params] as const,
    detail: (id: number) => ['identities', 'detail', id] as const,
    me: ['identities', 'me'] as const,
  },
  assets: {
    list: (params?: Record<string, unknown>) => ['assets', 'list', params] as const,
    detail: (id: number) => ['assets', 'detail', id] as const,
    mine: ['assets', 'mine'] as const,
    categories: ['assets', 'categories'] as const,
  },
  transfers: {
    list: (params?: Record<string, unknown>) => ['transfers', 'list', params] as const,
    detail: (id: number) => ['transfers', 'detail', id] as const,
    mine: ['transfers', 'mine'] as const,
    pending: ['transfers', 'pending'] as const,
  },
  audit: {
    list: (params?: Record<string, unknown>) => ['audit', 'list', params] as const,
    detail: (id: number) => ['audit', 'detail', id] as const,
    verify: ['audit', 'verify'] as const,
    stats: ['audit', 'stats'] as const,
  },
  blockchain: {
    status: ['blockchain', 'status'] as const,
    transaction: (hash: string) => ['blockchain', 'transaction', hash] as const,
    asset: (tokenId: number) => ['blockchain', 'asset', tokenId] as const,
    events: (params?: Record<string, unknown>) => ['blockchain', 'events', params] as const,
  },
  users: {
    list: (params?: Record<string, unknown>) => ['users', 'list', params] as const,
    detail: (id: number) => ['users', 'detail', id] as const,
  },
  admin: {
    roles: ['admin', 'roles'] as const,
    config: ['admin', 'config'] as const,
  },
} as const;

export function getQueryKeyPrefix(key: unknown[]): string {
  return Array.isArray(key) ? key[0] as string : 'unknown';
}

export function invalidateQueriesByPrefix(prefix: string) {
  return queryClient.invalidateQueries({ queryKey: [prefix] });
}

export function prefetchQueries(keys: unknown[][]) {
  return Promise.all(keys.map(key => queryClient.prefetchQuery({ queryKey: key })));
}

export function setQueryData<T>(key: unknown[], data: T) {
  return queryClient.setQueryData(key, data);
}

export function getQueryData<T>(key: unknown[]): T | undefined {
  return queryClient.getQueryData(key);
}

export function removeQueries(key: unknown[]) {
  return queryClient.removeQueries({ queryKey: key });
}

export function clearAllQueries() {
  return queryClient.clear();
}

export function getQueryCache() {
  return queryClient.getQueryCache();
}

export function getMutationCache() {
  return queryClient.getMutationCache();
}

if (import.meta.env.DEV) {
  window.__QUERY_CLIENT__ = queryClient;
  console.log('[Query] DevTools available at window.__QUERY_CLIENT__');
}

export { QueryClientProvider } from '@tanstack/react-query';
