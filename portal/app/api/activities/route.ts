import { NextRequest, NextResponse } from 'next/server';
import { fetchBackendRaw } from '@/lib/fetchBackend';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const params: any = {};
  for (const [key, value] of searchParams.entries()) {
    params[key] = Number(value) || value;
  }

  try {
    const response = await fetchBackendRaw<{ data: any[]; total: number; page: number; limit: number; totalPages: number }>('/activity/getAllActivities', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch activities' },
      { status: 500 }
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
    return NextResponse.json(
      { error: error.message || 'Failed to create activity' },
      { status: 500 }
    );
  }
}
