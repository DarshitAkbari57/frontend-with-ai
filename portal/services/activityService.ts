'use client';

import type { Activity, PaginatedResponse } from '@/types/api';

export async function getActivities(params?: {
  page?: number;
  limit?: number;
  experienceId?: number;
  [key: string]: any;
}): Promise<PaginatedResponse<Activity>> {
  const query = new URLSearchParams();
  if (params?.page !== undefined) {
    query.append('page', params.page.toString());
  }
  if (params?.limit !== undefined) {
    query.append('limit', params.limit.toString());
  }
  if (params?.experienceId !== undefined) {
    query.append('experienceId', params.experienceId.toString());
  }

  const res = await fetch(`/api/activities?${query.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch activities');
  }
  return res.json();
}

export async function getActivityById(id: number): Promise<Activity> {
  const res = await fetch(`/api/activities/${id}`);
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch activity');
  }
  return res.json();
}

export async function deleteActivity(id: number): Promise<{ success: boolean }> {
  const res = await fetch(`/api/activities/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to delete activity');
  }
  return res.json();
}

export async function updateActivity(id: number, updates: Partial<Activity>): Promise<Activity> {
  const res = await fetch(`/api/activities/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to update activity');
  }
  return res.json();
}
