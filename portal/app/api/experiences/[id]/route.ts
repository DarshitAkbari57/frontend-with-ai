import { NextRequest, NextResponse } from 'next/server';
import { fetchFromBackend } from '@/lib/backend';
import type { Experience } from '@/types/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const timezone = searchParams.get('timezone') ?? 'Asia/Kolkata';

    const data = await fetchFromBackend<Experience>(
      `/experience/${params.id}?timezone=${encodeURIComponent(timezone)}`,
      { method: 'GET' }
    );

    return NextResponse.json(data);
  } catch (error: any) {
    const status = error.status || 500;
    return NextResponse.json(
      { error: error.message || 'Failed to fetch experience' },
      { status }
    );
  }
}
