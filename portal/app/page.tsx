import React from 'react';
import { Calendar, Users, Heart, MapPin, Activity, Star, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { fetchPublic } from '@/lib/backend';

// 🔥 Force Next.js to fetch fresh data every time (Bypasses Cache)
export const dynamic = 'force-dynamic';

const NO_IMAGE = 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg';

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

async function getPublicExperiences(): Promise<ExperienceData[]> {
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

async function getPublicActivities(): Promise<ActivityData[]> {
  try {
    const response: any = await fetchPublic('/activity/public/getAll', {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json'
      },
      cache: 'no-store' // Don't cache the API response
    });
    
    // Bulletproof array extraction
    if (Array.isArray(response)) return response;
    if (response && Array.isArray(response.data)) return response.data;
    return [];
  } catch (error) {
    console.error('Failed to fetch public activities:', error);
    return [];
  }
}

export default async function LandingPage() {
  // Fetch data and take only the first 3 for the landing page
  const experiences = await getPublicExperiences();
  const topExperiences = experiences.slice(0, 3);
  const featuredExperience = topExperiences.length > 0 ? topExperiences[0] : null;
  
  const activities = await getPublicActivities();
  const topActivities = activities.slice(0, 3);
  
  return (
    <div className="min-h-screen bg-zinc-50 text-slate-900 font-sans selection:bg-emerald-500/20">
      
      {/* Navbar */}
      <header className="fixed top-0 z-50 w-full bg-slate-950/20 backdrop-blur-md border-b border-white/10 transition-all duration-300">
        <div className="flex items-center justify-between h-20 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="white" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight text-white">Experience Portal</span>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="relative w-full h-screen min-h-[600px] flex flex-col justify-center overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=2000" 
          alt="Bright Event Conference" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/80 to-slate-900/20"></div>
        
        <div className="relative z-10 flex flex-col justify-center px-4 md:px-8 max-w-7xl mx-auto w-full pt-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
              Discover extraordinary <br className="hidden md:block"/> experiences around you.
            </h1>
            <p className="text-slate-200 text-lg md:text-xl max-w-2xl font-medium mb-10">
              Join thousands of attendees and creators globally. Find your next adventure or host your own spectacular event.
            </p>
          </div>
        </div>
      </div>

      {/* Featured Experience Section */}
      {featuredExperience && (
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
            <div className="flex-1 space-y-6 max-w-xl">
              <h2 className="text-emerald-600 font-bold text-lg tracking-wide uppercase">Featured Experience</h2>
              <h3 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight">
                {featuredExperience.title}
              </h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                Find events to connect with people who share your interests. Whatever your interest, Experience Portal helps you connect with like-minded people. {featuredExperience.description}
              </p>
              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="text-emerald-500" size={20} />
                  <span className="font-medium">{new Date(featuredExperience.experienceStartDateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                {featuredExperience.location && (
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="text-emerald-500" size={20} />
                  <span className="font-medium truncate max-w-[200px] sm:max-w-full">{featuredExperience.location}</span>
                </div>
                )}
              </div>
              <div className="pt-6">
                <Link href={`/experience/${featuredExperience.id}`}>
                  <button className="px-8 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-xl shadow-slate-900/20 flex items-center gap-2 group w-full sm:w-auto justify-center">
                    Explore Experience
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>
            </div>
            
            <div className="flex-1 relative w-full mt-10 lg:mt-0">
               <div className="relative rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl shadow-emerald-500/10 border-8 border-white bg-white">
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                 <img 
                   src={featuredExperience.expPicture?.media || NO_IMAGE} 
                   alt={featuredExperience.title} 
                   className="w-full object-cover aspect-[4/3] transform hover:scale-105 transition-transform duration-700" 
                 />
                 <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
                    <Heart size={16} className="text-rose-500 fill-rose-500" />
                    <span className="font-bold text-slate-800 text-sm">{featuredExperience.likeCount} Likes</span>
                 </div>
               </div>
               <div className="absolute -z-10 top-1/2 -right-12 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-60 mix-blend-multiply"></div>
               <div className="absolute -z-10 -bottom-12 left-1/2 w-72 h-72 bg-blue-50 rounded-full blur-3xl opacity-60 mix-blend-multiply"></div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Trending Experiences */}
      <section className="py-24 bg-zinc-50 border-t border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 mb-4">
                Trending Experiences
              </h2>
              <p className="text-slate-500 text-lg max-w-2xl">Discover the most popular events happening around you. Don't miss out on these top-rated experiences.</p>
            </div>
            <Link href="/experience" className="hidden sm:flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors bg-emerald-50 px-5 py-2.5 rounded-full hover:bg-emerald-100 whitespace-nowrap">
              View all experiences <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {topExperiences.map((exp: ExperienceData) => (
              <Link href={`/experience/${exp.id}`} key={exp.id} className="group relative rounded-3xl overflow-hidden bg-white border border-slate-200 flex flex-col transition-all duration-300 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-500/10 cursor-pointer">
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
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-2xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                      {exp.title}
                    </h3>
                  </div>
                  
                  <p className="text-base text-slate-500 line-clamp-2 mb-6 flex-1">
                    {exp.description || 'No description available.'}
                  </p>

                  {exp.location && (
                  <div className="flex items-center gap-4 text-sm font-semibold text-slate-600 mb-6 mt-auto">
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 w-full">
                      <MapPin size={16} className="text-slate-400 shrink-0" /> 
                      <span className="truncate">{exp.location}</span>
                    </div>
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
          </div>
          
          <Link href="/experience" className="sm:hidden mt-8 w-full flex justify-center items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors bg-emerald-50 px-5 py-3 rounded-xl hover:bg-emerald-100">
            View all experiences <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Upcoming Activities */}
      <section className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 mb-4">
                Upcoming Activities
              </h2>
              <p className="text-slate-500 text-lg max-w-2xl">Find engaging activities and workshops tailored to your interests.</p>
            </div>
            <Link href="/activity" className="hidden sm:flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors bg-slate-50 px-5 py-2.5 rounded-full border border-slate-200 hover:bg-slate-100 whitespace-nowrap">
              Explore activities <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topActivities.map((act) => (
              <div key={act.id} className="flex gap-5 p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all duration-200 group cursor-pointer shadow-sm hover:shadow-xl hover:shadow-slate-200/50">
                <div className="w-28 h-28 sm:w-32 sm:h-32 shrink-0 rounded-xl overflow-hidden relative shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={act.activityPicture?.media || NO_IMAGE} 
                    alt={act.activityName} 
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" 
                  />
                </div>
                
                <div className="flex flex-col py-1 flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <h4 className="text-lg font-bold text-slate-900 truncate group-hover:text-emerald-600 transition-colors">
                      {act.activityName}
                    </h4>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                    {act.description || 'No description available.'}
                  </p>
                  
                  <div className="mt-auto items-end">
                    <div className="flex flex-col gap-1.5 text-xs font-semibold text-slate-500 mb-2">
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-emerald-500 shrink-0" />
                        <span className="truncate">
                          {new Date(act.activityStartDateTime).toLocaleDateString([], { month: 'short', day: 'numeric'})} • {new Date(act.activityStartDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
          
          <Link href="/activity" className="sm:hidden mt-8 w-full flex justify-center items-center gap-2 text-sm font-bold text-slate-600 transition-colors bg-slate-50 px-5 py-3 border border-slate-200 rounded-xl hover:bg-slate-100">
            Explore activities <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <div className="px-4 md:px-8 pb-8 pt-12 bg-white">
        <footer className="bg-[#212121] text-white rounded-[2rem] pt-16 pb-8 px-8 md:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
              <div className="col-span-1 md:col-span-2 space-y-4">
                <span className="font-bold text-2xl tracking-tight text-white mb-2 block">Experience Portal</span>
                <p className="text-slate-300 max-w-sm">Connect with people who share your interests through amazing events and activities around the world.</p>
                <div className="flex gap-4 pt-2">
                  <div className="w-10 h-10 rounded-full bg-[#323232] flex items-center justify-center text-white hover:bg-[#404040] cursor-pointer transition-colors"><Activity size={20} /></div>
                  <div className="w-10 h-10 rounded-full bg-[#323232] flex items-center justify-center text-white hover:bg-[#404040] cursor-pointer transition-colors"><Star size={20} /></div>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-white mb-4">Discover</h4>
                <ul className="space-y-3 text-slate-300 font-medium">
                  <li><a href="#" className="hover:text-white transition-colors">Trending Experiences</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Upcoming Activities</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Online Events</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-white mb-4">Company</h4>
                <ul className="space-y-3 text-slate-300 font-medium">
                  <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
                </ul>
              </div>
            </div>
            <div className="text-center text-slate-400 font-medium text-sm pt-8 border-t border-slate-600/30">
              &copy; 2026 Experience Portal. All rights reserved.
            </div>
          </div>
        </footer>
      </div>

    </div>
  );
}