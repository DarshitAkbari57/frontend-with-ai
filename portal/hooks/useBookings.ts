'use client';

import { useQuery } from '@tanstack/react-query';
import { PaginatedResponse, Booking } from '@/types/api';

interface UseBookingsParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: any;
}

export function useBookings(params: UseBookingsParams = {}) {
  return useQuery<PaginatedResponse<Booking>, Error>({
    queryKey: ['bookings', params],
    queryFn: async () => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query.append(key, String(value));
        }
      });
      const res = await fetch(`/api/bookings?${query.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch bookings');
      }
      return res.json();
    },
    staleTime: 60 * 1000,
    retry: 1,
  });
}
