'use client';

import { useQuery } from '@tanstack/react-query';
import { getExperienceById } from '@/services/experienceService';
import type { Experience } from '@/types/api';

export function useExperience(id?: number) {
  return useQuery<Experience, Error>({
    queryKey: ['experience', id],
    queryFn: () => getExperienceById(id as number),
    enabled: typeof id === 'number' && Number.isFinite(id) && id > 0,
    staleTime: 60 * 1000,
    retry: 1,
  });
}
