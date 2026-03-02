'use client';

import { useQuery } from '@tanstack/react-query';
import { PaginatedResponse, Activity } from '@/types/api';

interface UseActivitiesParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: any;
}

export function useActivities(params: UseActivitiesParams = {}) {
  return useQuery<PaginatedResponse<Activity>, Error>({
    queryKey: ['activities', params],
    queryFn: async () => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query.append(key, String(value));
        }
      });
      const res = await fetch(`/api/activities?${query.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch activities');
      }
      return res.json();
    },
    staleTime: 60 * 1000,
    retry: 1,
  });
}
