import { NextRequest, NextResponse } from 'next/server';
import { fetchBackendRaw } from '@/lib/backend';
import type { Activity } from '@/types/api';

function toPositiveInt(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function toFiniteNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return undefined;
}

export async function GET(request: NextRequest) {
  const startedAt = Date.now();
  try {
    const { searchParams } = new URL(request.url);
    const page = toPositiveInt(searchParams.get('page'), 1);
    const limit = toPositiveInt(searchParams.get('limit'), 20);
    const experienceId = searchParams.get('experienceId');
    const search = searchParams.get('search')?.trim().toLowerCase();

    const response = await fetchBackendRaw<Activity[]>('/activity', {
      method: 'GET',
    });

    let activities = Array.isArray(response.data) ? response.data : [];

    if (experienceId !== null) {
      const parsedExperienceId = Number.parseInt(experienceId, 10);
      if (Number.isFinite(parsedExperienceId)) {
        activities = activities.filter((activity) => activity.experienceId === parsedExperienceId);
      }
    }

    if (search) {
      activities = activities.filter((activity) =>
        `${activity.activityName} ${activity.description ?? ''} ${activity.activityLocation ?? ''}`
          .toLowerCase()
          .includes(search)
      );
    }

    const backendTotal =
      experienceId === null && !search
        ? toFiniteNumber((response as Record<string, unknown>).total) ??
          toFiniteNumber((response as Record<string, unknown>).totalCount) ??
          toFiniteNumber((response as Record<string, unknown>).count)
        : undefined;

    const total = backendTotal ?? activities.length;
    const hasExactTotal = backendTotal !== undefined;
    const totalPages = hasExactTotal
      ? Math.max(1, Math.ceil(total / limit))
      : Math.max(1, page + (activities.length === limit ? 1 : 0));
    const safePage = Math.min(page, totalPages);
    const startIndex = (safePage - 1) * limit;
    const data = activities.slice(startIndex, startIndex + limit);
    const hasMore = hasExactTotal ? safePage * limit < total : data.length === limit;

    return NextResponse.json({
      data,
      total,
      page: safePage,
      limit,
      totalPages,
      hasMore,
      hasExactTotal,
    });
  } catch (error: any) {
    const status = error.status || 500;
    return NextResponse.json(
      { error: error.message || 'Failed to fetch activities' },
      { status }
    );
  } finally {
    const durationMs = Date.now() - startedAt;
    console.info(`[api/activities] GET completed in ${durationMs}ms`);
  }
}

export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  try {
    const body = await request.json();
    const response = await fetchBackendRaw<any>('/activity/createActivity', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return NextResponse.json(response);
  } catch (error: any) {
    const status = error.status || 500;
    return NextResponse.json(
      { error: error.message || 'Failed to create activity' },
      { status }
    );
  } finally {
    const durationMs = Date.now() - startedAt;
    console.info(`[api/activities] POST completed in ${durationMs}ms`);
  }
}
