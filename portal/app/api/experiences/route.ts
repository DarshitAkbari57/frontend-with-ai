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

function extractExactTotal(response: Record<string, unknown>): number | undefined {
  const directCandidates: unknown[] = [
    response.total,
    response.totalCount,
    response.count,
    response.itemCount,
    response.recordsTotal,
  ];

  for (const candidate of directCandidates) {
    const total = toFiniteNumber(candidate);
    if (total !== undefined) {
      return total;
    }
  }

  const meta = response.meta;
  if (meta && typeof meta === 'object') {
    const typedMeta = meta as Record<string, unknown>;
    const metaCandidates: unknown[] = [
      typedMeta.total,
      typedMeta.totalCount,
      typedMeta.count,
      typedMeta.itemCount,
    ];

    for (const candidate of metaCandidates) {
      const total = toFiniteNumber(candidate);
      if (total !== undefined) {
        return total;
      }
    }

    const pagination = typedMeta.pagination;
    if (pagination && typeof pagination === 'object') {
      const typedPagination = pagination as Record<string, unknown>;
      const paginationCandidates: unknown[] = [
        typedPagination.total,
        typedPagination.totalCount,
        typedPagination.count,
        typedPagination.itemCount,
        typedPagination.recordsTotal,
      ];

      for (const candidate of paginationCandidates) {
        const total = toFiniteNumber(candidate);
        if (total !== undefined) {
          return total;
        }
      }
    }
  }

  return undefined;
}

export async function GET(request: NextRequest) {
  const startedAt = Date.now();
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

    const experiences = Array.isArray(response.data) ? response.data : [];
    const exactTotal = extractExactTotal(response as Record<string, unknown>);
    const hasExactTotal = exactTotal !== undefined;
    const total = exactTotal !== undefined
      ? Math.max(0, exactTotal)
      : Math.max(0, (page - 1) * limit + experiences.length);
    const hasMore = hasExactTotal
      ? page * limit < total
      : experiences.length === limit;
    const totalPages = hasExactTotal
      ? Math.max(1, Math.ceil(total / limit))
      : Math.max(1, page + (hasMore ? 1 : 0));

    return NextResponse.json({
      data: experiences,
      total,
      page,
      limit,
      totalPages,
      hasMore,
      hasExactTotal,
    });
  } catch (error: any) {
    const status = error.status || 500;
    return NextResponse.json(
      { error: error.message || 'Failed to fetch experiences' },
      { status }
    );
  } finally {
    const durationMs = Date.now() - startedAt;
    console.info(`[api/experiences] GET completed in ${durationMs}ms`);
  }
}
