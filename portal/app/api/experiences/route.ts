import { NextRequest, NextResponse } from 'next/server';
import { fetchFromBackend } from '@/lib/backend';
import type { Experience } from '@/types/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ?? '40000';
    const page = searchParams.get('page') ?? '0';
    const search = searchParams.get('search') ?? '';

    const body = {
      limit: parseInt(limit, 10),
      page: parseInt(page, 10),
      search,
    };

    const data = await fetchFromBackend<Experience[]>('/experience/getAllExperience', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return NextResponse.json(data);
  } catch (error: any) {
    const status = error.status || 500;
    return NextResponse.json(
      { error: error.message || 'Failed to fetch experiences' },
      { status }
    );
  }
}
