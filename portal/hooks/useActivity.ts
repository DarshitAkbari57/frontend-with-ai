'use client';

import { useQuery } from '@tanstack/react-query';
import { Activity } from '@/types/api';

interface UseActivityProps {
  id: string | number;
}

export function useActivity({ id }: UseActivityProps) {
  return useQuery<Activity, Error>({
    queryKey: ['activity', id],
    queryFn: async () => {
      const res = await fetch(`/api/activities/${id}`);
      if (!res.ok) {
        throw new Error('Failed to fetch activity');
      }
      return res.json();
    },
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}
