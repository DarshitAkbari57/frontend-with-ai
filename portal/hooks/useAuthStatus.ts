'use client';

import { useQuery } from '@tanstack/react-query';
import type { User } from '@/types/auth';

type AuthStatusResponse = {
  authenticated: boolean;
  user?: User;
};

export function useAuthStatus() {
  return useQuery<AuthStatusResponse, Error>({
    queryKey: ['auth-status'],
    queryFn: async () => {
      const res = await fetch('/api/auth/status', { cache: 'no-store' });

      if (res.status === 401) {
        return { authenticated: false };
      }

      if (!res.ok) {
        throw new Error('Failed to fetch auth status');
      }

      const data = (await res.json().catch(() => ({}))) as Partial<AuthStatusResponse>;
      return {
        authenticated: Boolean(data.authenticated),
        user: data.user,
      };
    },
    staleTime: 60 * 1000,
    retry: false,
  });
}
