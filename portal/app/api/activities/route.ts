import { NextRequest, NextResponse } from 'next/server';
import { fetchBackendRaw } from '@/lib/backend';
import type { Activity } from '@/types/api';

const ALLOWED_FILTERS = [
  'title',
  'description',
  'location',
  'creatorId',
  'isOnline',
  'controlBy',
  'startDate',
  'endDate',
  'search',
  'experienceId',
  'isDisabled',
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') ?? '20', 10);
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const backendPage = page - 1;

    const params = new URLSearchParams();
    params.append('page', backendPage.toString());
    params.append('limit', limit.toString());

    for (const [key, value] of searchParams.entries()) {
      if (ALLOWED_FILTERS.includes(key) && key !== 'page' && key !== 'limit') {
        params.append(key, value);
      }
    }

    const fullPath = `/activity?${params.toString()}`;
    const response = await fetchBackendRaw<Activity[]>(fullPath);

    const total = response.total ?? response.data.length;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: response.data,
      total,
      page,
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
