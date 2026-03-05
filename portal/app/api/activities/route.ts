import { NextRequest, NextResponse } from 'next/server';
import { fetchBackendRaw, fetchFromBackend } from '@/lib/backend';
import type { Activity } from '@/types/api';

function toPositiveInt(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function GET(request: NextRequest) {
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

    const total = activities.length;
    const totalPages = total === 0 ? 1 : Math.ceil(total / limit);
    const safePage = Math.min(page, totalPages);
    const startIndex = (safePage - 1) * limit;
    const data = activities.slice(startIndex, startIndex + limit);

    // Enrich paginated activities with activityPicture from detail endpoint
    const enriched = await Promise.all(
      data.map(async (activity) => {
        try {
          const detail = await fetchFromBackend<any>(
            `/activity/${activity.id}`,
            { method: 'GET' }
          );
          return {
            ...activity,
            activityPicture: detail.activityPicture ?? null,
          };
        } catch {
          return { ...activity, activityPicture: null };
        }
      })
    );

    return NextResponse.json({
      data: enriched,
      total,
      page: safePage,
      limit,
      totalPages,
    });
  } catch (error: any) {
    const status = error.status || 500;
    return NextResponse.json(
      { error: error.message || 'Failed to fetch activities' },
      { status }
    );
  }
}

export async function POST(request: NextRequest) {
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
  }
}
