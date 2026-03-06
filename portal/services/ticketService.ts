'use client';

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

export interface TicketsResponse {
  data: ExperienceTicketApiItem[];
  message: string;
  status: number;
}

export async function getExperienceTickets(params: {
  experienceId: number;
}): Promise<TicketsResponse> {
  const query = new URLSearchParams();
  query.append('experienceId', String(params.experienceId));

  const res = await fetch(`/api/tickets?${query.toString()}`);
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch tickets');
  }

  return res.json();
}
