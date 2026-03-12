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
      : 'Failed to fetch public experiences';

  return { status, message };
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown> = {
    limit: 10,
    page: 1,
    search: '',
  };

  try {
    const incoming = await request.json();
    if (incoming && typeof incoming === 'object' && !Array.isArray(incoming)) {
      body = incoming as Record<string, unknown>;
    }
  } catch {
    // Fall back to defaults when body is missing or invalid.
  }

  try {
    const data = await fetchPublic<Experience[]>('/experience/public/getAllExperience', {
      method: 'POST',
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(body),
      cache: 'force-cache',
      next: { revalidate: PUBLIC_REVALIDATE_SECONDS },
    });

    return NextResponse.json(
      {
        data: Array.isArray(data) ? data : [],
      },
      {
        headers: {
          'Cache-Control': `public, s-maxage=${PUBLIC_REVALIDATE_SECONDS}, stale-while-revalidate=300`,
        },
      }
    );
  } catch (error: unknown) {
    const { status, message } = getErrorDetails(error);
    return NextResponse.json({ error: message }, { status });
  }
}
