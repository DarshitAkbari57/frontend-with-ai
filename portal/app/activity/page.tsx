import React from 'react';
import { Clock, MapPin } from 'lucide-react';
import Link from 'next/link';
import ImageWithFallback from '@/components/ImageWithFallback';
import { fetchPublic } from '@/lib/backend';

const NO_IMAGE = 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg';
export const revalidate = 60;

interface ActivityData {
  id: number;
  activityName: string;
  description: string;
  activityStartDateTime: string;
  activityCost: number;
  activityLocation: string | null;
  isOnline: boolean;
  activityPicture?: { media: string | null } | null;
}

async function getAllActivities(): Promise<ActivityData[]> {
  try {
    const response: any = await fetchPublic('/activity/public/getAll', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    });
    
    if (response && Array.isArray(response.data)) {
      return response.data;
    }
    
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('Failed to fetch public activities:', error);
    return [];
  }
}

export default async function AllActivitiesPage() {
  const activities = await getAllActivities();
  
  return (
    <div className="min-h-screen bg-zinc-50 text-slate-900 font-sans selection:bg-emerald-500/20 pt-20">
      {/* Navbar for Activities Page (Simplified) */}
      <header className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 transition-all duration-300">
        <div className="flex items-center justify-between h-20 px-4 md:px-8 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="white" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">Experience Portal</span>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
            Upcoming Activities
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl">
            Find engaging activities and workshops tailored to your interests. Join our vibrant community and learn something new.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((act: ActivityData) => (
            <div key={act.id} className="flex gap-5 p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all duration-200 group cursor-pointer shadow-sm hover:shadow-xl hover:shadow-slate-200/50">
              <div className="w-28 h-28 sm:w-32 sm:h-32 shrink-0 rounded-xl overflow-hidden relative shadow-inner">
                <ImageWithFallback
                  src={act.activityPicture?.media || NO_IMAGE}
                  alt={act.activityName}
                  fill
                  sizes="(max-width: 640px) 112px, 128px"
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              
              <div className="flex flex-col py-1 flex-1 min-w-0">
                <h4 className="text-lg font-bold text-slate-900 truncate group-hover:text-emerald-600 transition-colors mb-1">
                  {act.activityName}
                </h4>
                <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                  {act.description || 'No description available.'}
                </p>
                
                <div className="mt-auto items-end">
                  <div className="flex flex-col gap-1.5 text-xs font-semibold text-slate-500 mb-2">
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-emerald-500 shrink-0" />
                      <span className="truncate">
                        {new Date(act.activityStartDateTime).toLocaleDateString([], { month: 'short', day: 'numeric'})} | {new Date(act.activityStartDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin size={14} className="text-slate-400 shrink-0" />
                      <span className="truncate">
                        {act.isOnline ? 'Online Event' : (act.activityLocation || 'Location TBD')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center mt-2">
                    <span className="text-sm font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                      {act.activityCost === 0 ? 'Free' : `$${act.activityCost}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
