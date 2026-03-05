import { NextRequest, NextResponse } from 'next/server';
import { fetchFromBackend } from '@/lib/backend';
import type { Activity } from '@/types/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const timezone = searchParams.get('timezone') ?? 'Asia/Kolkata';

    const data = await fetchFromBackend<Activity>(
      `/activity/${id}?timezone=${encodeURIComponent(timezone)}`,
      { method: 'GET' }
    );

    return NextResponse.json(data);
  } catch (error: any) {
    const status = error.status || 500;
    return NextResponse.json(
      { error: error.message || 'Failed to fetch activity' },
      { status }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = await fetchFromBackend<Activity>(`/activity/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });

    return NextResponse.json(data);
  } catch (error: any) {
    const status = error.status || 500;
    return NextResponse.json(
      { error: error.message || 'Failed to update activity' },
      { status }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await fetchFromBackend<{}>(`/activity/${id}`, { method: 'DELETE' });
    return new Response(null, { status: 204 });
  } catch (error: any) {
    const status = error.status || 500;
    return NextResponse.json(
      { error: error.message || 'Failed to delete activity' },
      { status }
    );
  }
}
