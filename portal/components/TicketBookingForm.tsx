'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

export function TicketBookingForm({ experienceName }: { experienceName: string }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    
    // Simulating an API call
    console.log(`Booking submitted for ${experienceName} by Name: ${name}, Phone: ${phone}`);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-sm h-full min-h-[300px]">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
          <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-slate-900">Booking Confirmed!</h3>
        <p className="text-slate-600">Thank you, {name}. We will send updates to {phone}.</p>
        <Button 
          variant="outline" 
          onClick={() => setIsSubmitted(false)}
          className="mt-4"
        >
          Book Another Ticket
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50 sticky top-24">
      <h3 className="text-2xl font-bold text-slate-900 mb-2">Reserve Your Spot</h3>
      <p className="text-slate-500 mb-8 font-medium">Book a ticket for {experienceName}. Fill out your details below.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-semibold text-slate-700">Full Name</label>
          <input
            type="text"
            id="name"
            placeholder="Jane Doe"
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-semibold text-slate-700">Phone Number</label>
          <input
            type="tel"
            id="phone"
            placeholder="+1 (555) 000-0000"
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="w-full py-4 mt-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={!name || !phone}
        >
          Confirm Booking
        </button>
      </form>
      
      <p className="text-xs text-center text-slate-400 mt-6 mt-4">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}
