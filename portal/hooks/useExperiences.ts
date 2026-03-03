'use client';

import { useQuery } from '@tanstack/react-query';
import { getExperiences } from '@/services/experienceService';
import type { PaginatedResponse, Experience } from '@/types/api';

interface UseExperiencesParams {
  page?: number;
  limit?: number;
  [key: string]: any;
}

export function useExperiences(params: UseExperiencesParams = {}) {
  return useQuery<PaginatedResponse<Experience>, Error>({
    queryKey: ['experiences', params],
    queryFn: () => getExperiences(params),
    staleTime: 60 * 1000,
    retry: 1,
  });
}
