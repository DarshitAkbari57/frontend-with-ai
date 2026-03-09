'use client';

import React, { useState, useEffect } from 'react';
import { TicketModal } from './TicketModal';

interface Ticket {
  id: number;
  title: string;
  description: string;
  cost: number;
  availableQuantity: number;
  ticketDate: string;
  isEnabled: boolean;
}

type Status = 'loading' | 'done' | 'error';

export function TicketsSection({ experienceId }: { experienceId: number }) {
  const [status, setStatus] = useState<Status>('loading');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    async function fetchTickets() {
      try {
        const res = await fetch(`/api/tickets/public/${experienceId}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to fetch tickets');
        setTickets(Array.isArray(json.data) ? json.data : []);
        setStatus('done');
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
        setStatus('error');
      }
    }
    fetchTickets();
  }, [experienceId]);

  return (
    <div id="tickets-section" className="mt-16 pt-16 border-t border-slate-200">
      <h2 className="text-xl font-bold tracking-[0.2em] text-slate-900 uppercase mb-8">
        Tickets
      </h2>
      
      {status === 'loading' && (
        <div className="flex justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-slate-900" />
        </div>
      )}

      {status === 'error' && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl font-medium border border-red-200">
          {errorMsg}
        </div>
      )}

      {status === 'done' && tickets.length === 0 && (
        <p className="text-slate-500 font-medium italic">No ticket available.</p>
      )}

      {status === 'done' && tickets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className="border border-slate-200 rounded-xl p-5 hover:border-emerald-300 hover:shadow-md transition-all bg-white cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <h4 className="font-bold text-slate-900 text-lg leading-tight">{ticket.title}</h4>
                <span className="shrink-0 font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100 text-sm">
                  {ticket.cost === 0 ? 'Free' : `$${ticket.cost}`}
                </span>
              </div>
              {ticket.description && (
                <p className="text-slate-500 text-sm mb-3 line-clamp-2">{ticket.description}</p>
              )}
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>{ticket.availableQuantity} spots left</span>
                {ticket.ticketDate && (
                  <span>{new Date(ticket.ticketDate).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          experienceId={experienceId}
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
}
