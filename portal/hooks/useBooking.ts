'use client';

import { useQuery } from '@tanstack/react-query';
import { Booking } from '@/types/api';

interface UseBookingProps {
  id: string | number;
}

export function useBooking({ id }: UseBookingProps) {
  return useQuery<Booking, Error>({
    queryKey: ['booking', id],
    queryFn: async () => {
      const res = await fetch(`/api/bookings/${id}`);
      if (!res.ok) {
        throw new Error('Failed to fetch booking');
      }
      return res.json();
    },
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}
