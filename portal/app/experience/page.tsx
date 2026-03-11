import React from 'react';
import { Calendar, Heart, MapPin, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { fetchPublic } from '@/lib/backend';

// 🔥 Force Next.js to fetch fresh data every time (Bypasses Cache)
export const dynamic = 'force-dynamic';

const NO_IMAGE = 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg';

interface ExperienceData {
  id: number;
  title: string;
  description: string;
  likeCount: number;
  commentCount: number;
  experienceStartDateTime: string;
  location: string | null;
  expPicture: { media: string | null } | null;
  userDetail: {
    id: number;
    userName: string;
    firstName: string | null;
    lastName: string | null;
    profilePicture: { media: string | null } | null;
  };
  [key: string]: any;
}

async function getAllExperiences(): Promise<ExperienceData[]> {
  try {
    // fetchPublic automatically returns json.data!
    const data = await fetchPublic<ExperienceData[]>('/experience/public/getAllExperience', {
      method: 'POST',
      headers: {
        'ngrok-skip-browser-warning': 'true'
        // Note: fetchPublic automatically adds 'Content-Type': 'application/json', so we don't need to repeat it
      },
      body: JSON.stringify({
        limit: 10, // Match Postman (or use 100 for the full page)
        page: 1,
        search: "" // Match Postman exactly
      }),
      cache: 'no-store'
    });
    
    // Since fetchPublic returns json.data, we just verify it's an array and return it
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to fetch public experiences:', error);
    return [];
  }
}

export default async function AllExperiencesPage() {
  const experiences = await getAllExperiences();
  
  return (
    <div className="min-h-screen bg-zinc-50 text-slate-900 font-sans selection:bg-emerald-500/20 pt-20">
      {/* Navbar */}
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
            All Experiences
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl">
            Explore our curated list of amazing experiences. From workshops to adventures, find what inspires you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {experiences.map((exp: ExperienceData) => (
            <Link href={`/experience/${exp.id}?from=${encodeURIComponent('/experience')}`} key={exp.id} className="group relative rounded-3xl overflow-hidden bg-white border border-slate-200 flex flex-col transition-all duration-300 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-500/10 cursor-pointer">
              <div className="aspect-[4/3] w-full relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={exp.expPicture?.media || NO_IMAGE} 
                  alt={exp.title}
                  className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
                  <Calendar size={16} className="text-emerald-600" />
                  <span className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                    {new Date(exp.experienceStartDateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-2xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 mb-3">
                  {exp.title}
                </h3>
                
                <p className="text-base text-slate-500 line-clamp-2 mb-6 flex-1">
                  {exp.description || 'No description available.'}
                </p>

                {exp.location && (
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 w-full mb-6">
                  <MapPin size={16} className="text-slate-400 shrink-0" /> 
                  <span className="text-sm font-semibold text-slate-600 truncate">{exp.location}</span>
                </div>
                )}
              </div>
              
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={exp.userDetail?.profilePicture?.media || NO_IMAGE} className="w-8 h-8 rounded-full object-cover shadow-sm border border-white" alt="Host" />
                  <span className="text-sm font-medium text-slate-500">by <span className="font-bold text-slate-700 truncate max-w-[100px] inline-block align-bottom">{exp.userDetail?.userName || 'Unknown'}</span></span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-sm">
                  <Heart size={16} className="text-rose-500" /> {exp.likeCount}
                </div>
              </div>
            </Link>
          ))}
          
          {experiences.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
              No experiences found at this time.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
