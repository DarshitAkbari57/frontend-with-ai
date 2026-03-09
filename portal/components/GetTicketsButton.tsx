'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

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

export function GetTicketsButton({ experienceId }: { experienceId: number }) {
  const [status, setStatus] = useState<Status>('idle');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [open, setOpen] = useState(false);

  async function handleClick() {
    setOpen(true);
    if (status === 'done') return; // already fetched
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

  function handleClose() {
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="px-8 py-3 bg-white text-slate-900 text-sm font-bold uppercase tracking-widest hover:bg-slate-100 transition-colors"
      >
        Get Tickets
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm"
          onClick={handleClose}
        >
          <div
            className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">Available Tickets</h3>
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {status === 'loading' && (
                <div className="flex justify-center py-10">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-slate-900" />
                </div>
              )}

              {status === 'error' && (
                <div className="space-y-4">
                  <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl p-4 font-medium">
                    {errorMsg}
                  </p>
                  <button
                    onClick={() => { setStatus('idle'); handleClick(); }}
                    className="w-full py-3 border border-slate-300 hover:bg-slate-50 font-semibold rounded-xl transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {status === 'done' && tickets.length === 0 && (
                <p className="text-slate-500 text-center py-8 font-medium">
                  No tickets available for this experience.
                </p>
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
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
