import type { Experience } from '@/types/api';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') return '';
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
};

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
  hasMore?: boolean;
  hasExactTotal?: boolean;
}> {
  const query = new URLSearchParams();
  if (params.page !== undefined) {
    query.append('page', params.page.toString());
  }
  if (params.limit !== undefined) {
    query.append('limit', params.limit.toString());
  }
  Object.entries(params).forEach(([key, value]) => {
    if (key !== 'page' && key !== 'limit' && value !== undefined && value !== null) {
      query.append(key, String(value));
    }
  });

  const res = await fetch(`${getBaseUrl()}/api/experiences?${query.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch experiences');
  }
  return res.json();
}

export async function getExperienceById(id: number): Promise<Experience> {
  const res = await fetch(`${getBaseUrl()}/api/experiences/${id}`);
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch experience');
  }
  return res.json();
}

export async function deleteExperience(id: number): Promise<{ success: boolean }> {
  const res = await fetch(`${getBaseUrl()}/api/experiences/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to delete experience');
  }
  return res.json();
}

export async function updateExperience(id: number, updates: Partial<Experience>): Promise<Experience> {
  const res = await fetch(`${getBaseUrl()}/api/experiences/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to update experience');
  }
  return res.json();
}
