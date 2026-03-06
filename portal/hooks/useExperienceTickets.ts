'use client';

import { useQuery } from '@tanstack/react-query';
import { getExperienceTickets, type TicketsResponse } from '@/services/ticketService';

export function useExperienceTickets(experienceId?: number) {
  return useQuery<TicketsResponse, Error>({
    queryKey: ['experience-tickets', experienceId],
    queryFn: () => getExperienceTickets({ experienceId: experienceId as number }),
    enabled: typeof experienceId === 'number' && Number.isFinite(experienceId) && experienceId > 0,
    staleTime: 60 * 1000,
    retry: 1,
  });
}
