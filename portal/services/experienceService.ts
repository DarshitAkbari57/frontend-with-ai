import { Experience } from '@/types/api';

export async function getExperiences(params: {
  page?: number;
  limit?: number;
  [key: string]: any;
}): Promise<{
  data: Experience[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const query = new URLSearchParams();
  if (params.page !== undefined) {
    query.append('page', params.page.toString());
  }
  if (params.limit !== undefined) {
    query.append('limit', params.limit.toString());
  }
  // Append other filter parameters
  Object.entries(params).forEach(([key, value]) => {
    if (key !== 'page' && key !== 'limit' && value !== undefined && value !== null) {
      query.append(key, String(value));
    }
  });

  const res = await fetch(`/api/experiences?${query.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch experiences');
  }
  return res.json();
}
