'use client';

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { X, Loader2, CheckCircle2 } from 'lucide-react';

// Use a placeholder public key if env var is missing
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder'
);

interface Ticket {
  id: number;
  title: string;
  description: string;
  cost: number;
  availableQuantity: number;
  ticketDate: string;
  isEnabled: boolean;
}

interface TicketModalProps {
  ticket: Ticket;
  experienceId: number;
  isOpen: boolean;
  onClose: () => void;
}

function CheckoutForm({
  ticket,
  experienceId,
  onClose,
}: {
  ticket: Ticket;
  experienceId: number;
  onClose: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [quantity, setQuantity] = useState(1);

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Using fee = 0 as default, or adjust based on your requirement
  const fee = 0; 
  // calculate ticket price = cost+fee*(user quantity)
  // Wait, the prompt said "cost + fee * (user quantity)", keeping literal interpretation:
  const totalPrice = ticket.cost * quantity + fee * quantity; 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (quantity < 1 || quantity > ticket.availableQuantity) {
      setErrorMessage(`Quantity must be between 1 and ${ticket.availableQuantity}`);
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setStatus('error');
      setErrorMessage('Card element not found');
      return;
    }

    // Only create token if price is greater than 0
    let token = null;
    if (totalPrice > 0) {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: username,
          phone: phone,
        },
      });

      if (error) {
        setErrorMessage(error.message || 'Payment failed');
        setStatus('error');
        return;
      }
      token = paymentMethod?.id;
    }

    try {
      // Send token + details to backend
      const res = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: ticket.id,
          experienceId: experienceId,
          username,
          phone,
          quantity,
          totalPrice,
          paymentToken: token,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Failed to create booking');
      }

      setStatus('success');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl max-w-md w-full mx-4 shadow-xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Booking Confirmed!</h3>
        <p className="text-slate-600 mb-6">
          Your tickets for <strong className="font-semibold text-slate-800">{ticket.title}</strong> have been successfully booked.
        </p>
        <button
          onClick={onClose}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl w-full max-w-lg mx-4 flex flex-col max-h-[90vh] shadow-2xl overflow-hidden border border-slate-100">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div>
          <h3 className="text-xl font-bold text-slate-900 leading-tight mb-1">{ticket.title}</h3>
          <p className="text-sm font-medium text-slate-500">
            {new Date(ticket.ticketDate).toLocaleDateString()} &middot; {ticket.availableQuantity} spots left
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form Content */}
      <div className="p-6 overflow-y-auto">
        <form id="booking-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <h4 className="text-sm font-bold tracking-wider text-slate-500 uppercase mb-2">Guest Details</h4>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800 bg-white"
                placeholder="John Doe"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800 bg-white"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={ticket.availableQuantity}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all font-medium text-slate-800 bg-white"
                />
              </div>
            </div>
          </div>

          {totalPrice > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold tracking-wider text-slate-500 uppercase">Payment Details</h4>
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <CardElement 
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#1e293b',
                        '::placeholder': { color: '#94a3b8' },
                        fontFamily: 'system-ui, -apple-system, sans-serif'
                      },
                      invalid: {
                        color: '#ef4444',
                      },
                    },
                  }} 
                />
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl font-medium border border-red-200 text-sm">
              {errorMessage}
            </div>
          )}
        </form>
      </div>

      {/* Footer Output */}
      <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <span className="text-slate-500 font-semibold">Total Cost</span>
          <span className="text-2xl font-black text-slate-900">
            {totalPrice === 0 ? 'Free' : `$${totalPrice.toFixed(2)}`}
          </span>
        </div>

        <button
          type="submit"
          form="booking-form"
          disabled={status === 'loading' || !stripe}
          className="w-full py-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay ${totalPrice === 0 ? 'Free' : `$${totalPrice.toFixed(2)}`}`
          )}
        </button>
      </div>
    </div>
  );
}

export function TicketModal({ ticket, experienceId, isOpen, onClose }: TicketModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className="relative z-10 w-full flex justify-center animate-in fade-in zoom-in-95 duration-200">
        <Elements stripe={stripePromise}>
          <CheckoutForm ticket={ticket} experienceId={experienceId} onClose={onClose} />
        </Elements>
      </div>
    </div>
  );
}
