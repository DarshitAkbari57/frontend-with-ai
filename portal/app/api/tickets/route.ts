import { NextRequest, NextResponse } from 'next/server';
import { fetchBackendRaw } from '@/lib/backend';

export interface ExperienceTicketApiItem {
  id: number;
  title: string;
  description: string;
  cost: number;
  fee: number;
  limit: number;
  ticketDate: string;
  availableQuantity: number;
  maximumQuantity: number;
  isEnabled: boolean;
  termsLink: string;
  isPermission: boolean;
  ticketFor: string;
  parentId: number;
  userId: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

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

function toBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  return fallback;
}

function normalizeTicketRecord(source: unknown): ExperienceTicketApiItem | null {
  if (!isRecord(source)) {
    return null;
  }

  const id = toFiniteNumber(source.id);
  const title = asNonEmptyString(source.title);
  if (id === undefined || !title) {
    return null;
  }

  return {
    id,
    title,
    description: asNonEmptyString(source.description) ?? '',
    cost: toFiniteNumber(source.cost) ?? 0,
    fee: toFiniteNumber(source.fee) ?? 0,
    limit: toFiniteNumber(source.limit) ?? 0,
    ticketDate: asNonEmptyString(source.ticketDate) ?? '',
    availableQuantity: toFiniteNumber(source.availableQuantity) ?? 0,
    maximumQuantity: toFiniteNumber(source.maximumQuantity) ?? 0,
    isEnabled: toBoolean(source.isEnabled),
    termsLink: asNonEmptyString(source.termsLink) ?? '',
    isPermission: toBoolean(source.isPermission),
    ticketFor: asNonEmptyString(source.ticketFor) ?? '',
    parentId: toFiniteNumber(source.parentId) ?? 0,
    userId: toFiniteNumber(source.userId) ?? 0,
    isDeleted: toBoolean(source.isDeleted),
    createdAt: asNonEmptyString(source.createdAt) ?? '',
    updatedAt: asNonEmptyString(source.updatedAt) ?? '',
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const experienceId = toFiniteNumber(searchParams.get('experienceId'));

    if (experienceId === undefined) {
      return NextResponse.json(
        { error: 'experienceId query parameter is required' },
        { status: 400 }
      );
    }

    const response = await fetchBackendRaw<unknown>(`/ticket/getallticket/${experienceId}`, {
      method: 'GET',
    });

    const rawTickets = Array.isArray(response.data) ? response.data : [];
    const tickets = rawTickets
      .map((entry) => normalizeTicketRecord(entry))
      .filter((entry): entry is ExperienceTicketApiItem => Boolean(entry));

    return NextResponse.json({
      data: tickets,
      message: asNonEmptyString(response.message) ?? 'Ticket fetched successfully!',
      status: toFiniteNumber(response.status) ?? 200,
    });
  } catch (error: unknown) {
    const status =
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      typeof (error as { status: unknown }).status === 'number'
        ? ((error as { status: number }).status)
        : 500;
    return NextResponse.json(
      {
        error:
          typeof error === 'object' &&
          error !== null &&
          'message' in error &&
          typeof (error as { message: unknown }).message === 'string'
            ? (error as { message: string }).message
            : 'Failed to fetch tickets',
      },
      { status }
    );
  }
}
