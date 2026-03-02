import { NextRequest, NextResponse } from 'next/server';
import { fetchBackendRaw } from '@/lib/backend';
import type { Experience } from '@/types/api';

const ALLOWED_FILTERS = [
  'title',
  'description',
  'location',
  'address',
  'createdBy',
  'isDisabled',
  'isDeleted',
  'isPined',
  'isProtected',
  'isOnline',
  'experienceFor',
  'controlBy',
  'experienceCost',
  'freeExpCost',
  'experienceStartDateTime',
  'experienceEndDateTime',
  'createdAt',
  'experienceOwnerId',
  'search',
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') ?? '20', 10);
    const page = parseInt(searchParams.get('page') ?? '1', 10); // 1-indexed
    const backendPage = page - 1; // convert to 0-indexed for backend

    const body: Record<string, any> = {
      page: backendPage,
      limit,
    };

    for (const [key, value] of searchParams.entries()) {
      if (ALLOWED_FILTERS.includes(key) && key !== 'page' && key !== 'limit') {
        if (value === 'true') {
          body[key] = true;
        } else if (value === 'false') {
          body[key] = false;
        } else if (!isNaN(Number(value))) {
          body[key] = Number(value);
        } else {
          body[key] = value;
        }
      }
    }

    const response = await fetchBackendRaw<Experience[]>('/experience/getAllExperience', {
      method: 'POST',
      body: JSON.stringify(body),
    });

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
      { error: error.message || 'Failed to fetch experiences' },
      { status }
    );
  }
}
