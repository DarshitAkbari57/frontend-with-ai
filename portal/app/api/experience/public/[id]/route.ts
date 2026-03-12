import { NextRequest, NextResponse } from 'next/server';
import { fetchPublic } from '@/lib/backend';
import type { Experience } from '@/types/api';

const PUBLIC_REVALIDATE_SECONDS = 60;

function getErrorDetails(error: unknown): { status: number; message: string } {
  const status =
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof (error as { status: unknown }).status === 'number'
      ? (error as { status: number }).status
      : 500;

  const message =
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
      ? (error as { message: string }).message
      : 'Failed to fetch public experience';

  return { status, message };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const experienceId = Number(id);

  if (!Number.isFinite(experienceId)) {
    return NextResponse.json({ error: 'Invalid experience id' }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const timezone = searchParams.get('timezone') ?? 'UTC';

  try {
    const data = await fetchPublic<Experience>(
      `/experience/public/${experienceId}?timezone=${encodeURIComponent(timezone)}`,
      {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
        cache: 'force-cache',
        next: { revalidate: PUBLIC_REVALIDATE_SECONDS },
      }
    );

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': `public, s-maxage=${PUBLIC_REVALIDATE_SECONDS}, stale-while-revalidate=300`,
      },
    });
  } catch (error: unknown) {
    const { status, message } = getErrorDetails(error);
    return NextResponse.json({ error: message }, { status });
  }
}
