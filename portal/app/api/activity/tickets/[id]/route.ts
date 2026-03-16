import { NextRequest, NextResponse } from 'next/server';
import { fetchPublic } from '@/lib/backend';

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
    const data = await fetchPublic<unknown[]>(`/ticket/getAllTicket/${activityId}`);
    const tickets = Array.isArray(data) ? data : [];
    return NextResponse.json({ data: tickets });
  } catch (error: unknown) {
    const status =
      typeof error === 'object' && error !== null && 'status' in error &&
      typeof (error as { status: unknown }).status === 'number'
        ? (error as { status: number }).status
        : 500;
    const message =
      typeof error === 'object' && error !== null && 'message' in error &&
      typeof (error as { message: unknown }).message === 'string'
        ? (error as { message: string }).message
        : 'Failed to fetch activity tickets';
    return NextResponse.json({ error: message }, { status });
  }
}
