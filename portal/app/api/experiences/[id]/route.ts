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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await fetchFromBackend<{}>(`/experience/${params.id}`, { method: 'DELETE' });
    return new Response(null, { status: 204 });
  } catch (error: any) {
    const status = error.status || 500;
    return NextResponse.json(
      { error: error.message || 'Failed to delete experience' },
      { status }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const data = await fetchFromBackend<Experience>(`/experience/${params.id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return NextResponse.json(data);
  } catch (error: any) {
    const status = error.status || 500;
    return NextResponse.json(
      { error: error.message || 'Failed to update experience status' },
      { status }
    );
  }
}
