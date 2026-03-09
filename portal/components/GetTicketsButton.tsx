'use client';

import React from 'react';

export function GetTicketsButton() {
  function handleClick() {
    const el = document.getElementById('tickets-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <button
      onClick={handleClick}
      className="px-8 py-3 bg-white text-slate-900 text-sm font-bold uppercase tracking-widest hover:bg-slate-100 transition-colors"
    >
      Get Tickets
    </button>
  );
}

