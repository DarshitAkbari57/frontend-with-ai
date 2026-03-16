import { NextRequest, NextResponse } from 'next/server';
import { fetchPublic } from '@/lib/backend';

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
      : 'Failed to fetch public activity';

  return { status, message };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const activityId = Number(id);

  if (!Number.isFinite(activityId)) {
    return NextResponse.json({ error: 'Invalid activity id' }, { status: 400 });
  }

  try {
    // The backend's /activity/public/{id} endpoint requires auth,
    // so we fetch all public activities and filter by ID instead.
    const response: any = await fetchPublic('/activity/public/getAll', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      cache: 'no-store',
    });

    const activities = response && Array.isArray(response.data)
      ? response.data
      : Array.isArray(response)
        ? response
        : [];

    const activity = activities.find((a: any) => a.id === activityId);

    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(activity);
  } catch (error: unknown) {
    const { status, message } = getErrorDetails(error);
    console.error(`[Activity Public API] Error fetching activity ${activityId}:`, message, 'Status:', status);
    return NextResponse.json({ error: message }, { status });
  }
}
