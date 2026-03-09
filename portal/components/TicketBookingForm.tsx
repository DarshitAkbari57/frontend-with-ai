'use client';

import React, { useState } from 'react';

interface Ticket {
  id: number;
  title: string;
  description: string;
  cost: number;
  availableQuantity: number;
  ticketDate: string;
  isEnabled: boolean;
}

type Status = 'idle' | 'loading' | 'done' | 'error';

export function TicketBookingForm({
  experienceName,
  experienceId,
}: {
  experienceName: string;
  experienceId: number;
}) {
  const [status, setStatus] = useState<Status>('idle');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleGetTickets() {
    setStatus('loading');
    setErrorMsg('');
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

  return (
    <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50 sticky top-24">
      <h3 className="text-2xl font-bold text-slate-900 mb-2">Get Tickets</h3>
      <p className="text-slate-500 mb-6 font-medium">
        Available tickets for <span className="font-semibold text-slate-800">{experienceName}</span>.
      </p>

      {status === 'idle' && (
        <button
          onClick={handleGetTickets}
          className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 transition-all active:scale-[0.98]"
        >
          Get Tickets
        </button>
      )}

      {status === 'loading' && (
        <div className="flex justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-slate-900" />
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-4">
          <p className="text-red-600 font-medium text-sm bg-red-50 border border-red-200 rounded-xl p-4">
            {errorMsg}
          </p>
          <button
            onClick={handleGetTickets}
            className="w-full py-3 border border-slate-300 hover:bg-slate-50 font-semibold rounded-xl transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {status === 'done' && tickets.length === 0 && (
        <p className="text-slate-500 text-center py-8 font-medium">No tickets available for this experience.</p>
      )}

      {status === 'done' && tickets.length > 0 && (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="border border-slate-200 rounded-xl p-5 hover:border-emerald-300 hover:shadow-md transition-all"
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

          <button
            onClick={() => setStatus('idle')}
            className="w-full mt-2 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold rounded-xl transition-colors text-sm"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
}
