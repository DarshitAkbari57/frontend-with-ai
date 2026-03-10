'use client';

import React, { useRef } from 'react';
import type { Activity } from '@/types/api';
import { Clock, Activity as ActivityIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export function ActivitiesSlider({ activities }: { activities: Activity[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth / 2;
      scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth / 2;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (activities.length === 0) {
    return <div className="text-slate-500 italic">No specific activity items available.</div>;
  }

  return (
    <div className="w-full overflow-hidden relative group">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold tracking-[0.2em] text-slate-900 uppercase">
          Activities
        </h2>
        
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full hidden sm:inline-block">
            {activities.length} {activities.length === 1 ? 'Activity' : 'Activities'}
          </span>
          
          {activities.length > 2 && (
            <div className="flex items-center gap-2">
              <button 
                onClick={scrollLeft}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:border-slate-800 hover:bg-slate-50 transition-colors text-slate-600 disabled:opacity-50"
                aria-label="Scroll left"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={scrollRight}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:border-slate-800 hover:bg-slate-50 transition-colors text-slate-600 disabled:opacity-50"
                aria-label="Scroll right"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-8 pt-2 px-2 -mx-2 snap-x snap-mandatory no-scrollbar scroll-smooth"
      >
        {activities.map((act) => (
          <div key={act.id} className="flex-none min-w-[280px] w-[85%] sm:w-[calc(50%-12px)] snap-start">
            <div className="flex flex-col group/card bg-white border border-slate-100 rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full">
              <div className="w-full aspect-[4/3] bg-slate-100 flex items-center justify-center relative overflow-hidden">
                {act.activityPicture?.media ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={act.activityPicture.media} alt={act.activityName} className="object-cover w-full h-full group-hover/card:scale-105 transition-transform duration-700" />
                ) : (
                  <ActivityIcon className="text-slate-300" size={48} />
                )}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm text-xs font-bold uppercase tracking-wider text-slate-900 border border-slate-100/50">
                  {act.activityCost === 0 ? 'Free' : `$${act.activityCost}`}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-[19px] font-bold text-slate-900 mb-3 leading-tight">{act.activityName}</h3>
                
                {/* Timing */}
                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-4">
                  <Clock size={16} className="text-slate-400 shrink-0" />
                  <span className="leading-tight">
                    {new Date(act.activityStartDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {act.activityEndDateTime && ` - ${new Date(act.activityEndDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                  </span>
                </div>

                {/* Description */}
                <div className="mt-auto pt-5 border-t border-slate-100">
                  {act.description ? (
                    <p className="text-slate-600 text-[15px] leading-relaxed line-clamp-2">{act.description}</p>
                  ) : (
                    <p className="text-slate-400 text-[15px] italic">No description provided.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
