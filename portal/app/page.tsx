import React from 'react';
import { Calendar, Heart, MapPin, Activity, Star, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import ImageWithFallback from '@/components/ImageWithFallback';
import { fetchPublic } from '@/lib/backend';

// Revalidate public landing content periodically for faster response.
const REVALIDATE_SECONDS = 60;
export const revalidate = 60;

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
  [key: string]: unknown;
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
      cache: 'force-cache',
      next: { revalidate: REVALIDATE_SECONDS }
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
    const response: ActivityData[] | { data: ActivityData[] } = await fetchPublic('/activity/public/getAll', {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json'
      },
      cache: 'force-cache',
      next: { revalidate: REVALIDATE_SECONDS }
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
  const [experiences, activities] = await Promise.all([
    getPublicExperiences(),
    getPublicActivities(),
  ]);
  const topExperiences = experiences.slice(0, 3);
  const featuredExperience = topExperiences.length > 0 ? topExperiences[0] : null;
  const topActivities = activities.slice(0, 3);
  
  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      
      {/* Background Animated Blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[45%] h-[55%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[30%] right-[10%] w-[35%] h-[35%] bg-purple-600/10 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
        <div className="absolute bottom-[20%] left-[10%] w-[40%] h-[40%] bg-pink-600/5 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-cyan-600/5 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '3s' }}></div>
        <div className="absolute bottom-[-10%] right-[30%] w-[40%] h-[40%] bg-indigo-600/5 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '5s' }}></div>
      </div>

      {/* Navbar */}
      <header className="fixed top-0 z-50 w-full bg-slate-950/40 backdrop-blur-xl border-b border-white/5 transition-all duration-500">
        <div className="flex items-center justify-between h-20 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform duration-500">
              <Star size={22} fill="white" className="text-white" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-gradient-vibrant group-hover:drop-shadow-[0_0_10px_rgba(236,72,153,0.3)] transition-all">Experience Portal</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <button className="px-6 py-2.5 bg-emerald-500 text-[#020617] font-black rounded-xl glow-button text-sm tracking-wide">
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="relative w-full min-h-[100svh] flex flex-col justify-center overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=2000&q=80"
            alt="Vibrant Event Background"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-40 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/20 via-[#020617]/80 to-[#020617]"></div>
          <div className="absolute inset-0 bg-mesh-vibrant opacity-60"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-4 md:px-8 max-w-7xl mx-auto w-full pt-20">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-sm font-bold mb-8 animate-float shadow-[0_0_20px_rgba(236,72,153,0.1)]">
              <Activity size={16} />
              <span>Explore the Extraordinary</span>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tighter mb-8">
              Discover <span className="text-gradient-vibrant">Limitless</span> <br /> Experiences.
            </h1>
            <p className="text-slate-300 text-xl md:text-2xl max-w-2xl font-medium mb-12 leading-relaxed">
              Step into a world of curated adventures. From high-octane thrillers to serene retreats, find the moments that define your story.
            </p>
            <div className="flex flex-wrap gap-5">
              <Link href="/experience">
                <button className="px-10 py-5 bg-emerald-500 text-[#020617] font-black rounded-2xl hover:bg-emerald-400 transition-all shadow-[0_0_30px_-5px_rgba(16,185,129,0.5)] flex items-center gap-3 group text-lg glow-button">
                  Start Exploring
                  <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* Featured Experience Section */}
      {featuredExperience && (
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24">
            <div className="flex-1 space-y-8 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-[0.2em]">
                Spotlight
              </div>
              <h3 className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-tight tracking-tight">
                <span className="text-gradient-vibrant">{featuredExperience.title}</span>
              </h3>
              <p className="text-xl text-slate-400 leading-relaxed font-medium">
                {featuredExperience.description || "Discover this unique opportunity to connect and grow."}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase">Date & Time</div>
                    <div className="font-bold text-white">{new Date(featuredExperience.experienceStartDateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  </div>
                </div>
                {featuredExperience.location && (
                <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase">Location</div>
                    <div className="font-bold text-white truncate max-w-[150px]">{featuredExperience.location}</div>
                  </div>
                </div>
                )}
              </div>

              <div className="pt-8">
                <Link href={`/experience/${featuredExperience.id}?from=${encodeURIComponent('/')}`}>
                  <button className="px-10 py-5 bg-white text-[#020617] font-black rounded-2xl hover:bg-emerald-500 transition-all shadow-xl flex items-center gap-3 group">
                    View Details
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>
            </div>
            
            <div className="flex-1 relative w-full lg:max-w-xl">
               <div className="relative z-10 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl group">
                 <ImageWithFallback
                   src={featuredExperience.expPicture?.media || NO_IMAGE}
                   alt={featuredExperience.title}
                   width={960}
                   height={1280}
                   sizes="(max-width: 1024px) 100vw, 50vw"
                   className="w-full object-cover aspect-[3/4] transform group-hover:scale-110 transition-transform duration-1000"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60"></div>
                
               </div>
               {/* Decorative elements behind image */}
               <div className="absolute -top-10 -right-10 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -z-0"></div>
               <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -z-0"></div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Trending Experiences */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-16 gap-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-white">
                Trending <span className="text-gradient-vibrant">Now</span>
              </h2>
              <p className="text-slate-400 text-xl max-w-2xl font-medium">Be part of the moments everyone is talking about.</p>
            </div>
            <Link href="/experience" className="group flex items-center gap-3 text-lg font-bold text-emerald-400 hover:text-emerald-300 transition-all bg-emerald-500/5 px-8 py-4 rounded-2xl border border-emerald-500/10 hover:border-emerald-500/30 whitespace-nowrap">
              View All <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {topExperiences.map((exp: ExperienceData, index: number) => (
              <Link href={`/experience/${exp.id}?from=${encodeURIComponent('/')}`} key={exp.id} className="group relative rounded-[2rem] overflow-hidden glass-card inner-glow flex flex-col transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_-20px_rgba(236,72,153,0.3)]">
                <div className="aspect-[11/10] w-full relative overflow-hidden">
                  <ImageWithFallback
                    src={exp.expPicture?.media || NO_IMAGE}
                    alt={exp.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-1000 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60"></div>
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <div className="glass px-4 py-2 rounded-xl border border-white/20 flex items-center gap-2">
                      <Calendar size={14} className="text-emerald-400" />
                      <span className="text-xs font-black text-white uppercase tracking-widest">
                        {new Date(exp.experienceStartDateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest self-start ${
                      index % 4 === 0 ? 'badge-nature' : index % 4 === 1 ? 'badge-tech' : index % 4 === 2 ? 'badge-culture' : 'badge-adventure'
                    }`}>
                      {index % 4 === 0 ? 'Nature' : index % 4 === 1 ? 'Tech' : index % 4 === 2 ? 'Culture' : 'Adventure'}
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-full glass border border-white/20 flex items-center justify-center text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)] hover:scale-110 transition-transform">
                    <Heart size={20} fill={index % 3 === 0 ? "currentColor" : "none"} />
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col relative">
                  <h3 className="text-2xl font-black text-white group-hover:text-emerald-400 transition-colors line-clamp-1 mb-3">
                    {exp.title}
                  </h3>
                  
                  <p className="text-base text-slate-400 font-medium line-clamp-2 mb-8 flex-1">
                    {exp.description || 'Step into an unforgettable experience curated just for you.'}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <ImageWithFallback
                          src={exp.userDetail?.profilePicture?.media || NO_IMAGE}
                          className="w-10 h-10 rounded-xl object-cover border border-white/10"
                          alt="Host"
                          width={40}
                          height={40}
                          sizes="40px"
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#020617]"></div>
                      </div>
                      <span className="text-sm font-bold text-slate-400">by <span className="text-white">{exp.userDetail?.userName || 'Pro'}</span></span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-500">
                      <Heart size={16} className="fill-rose-500" />
                      <span className="font-black text-sm">{exp.likeCount}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Activities */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-16 gap-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-white">
                Upcoming <span className="text-gradient-vibrant">Activities</span>
              </h2>
              <p className="text-slate-400 text-xl max-w-2xl font-medium">Fine-tune your skills or learn something entirely new.</p>
            </div>
            <Link href="/activity" className="group flex items-center gap-3 text-lg font-bold text-slate-300 hover:text-white transition-all bg-white/5 px-8 py-4 rounded-2xl border border-white/10 hover:border-white/20 whitespace-nowrap backdrop-blur-md">
              Explore All <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {topActivities.map((act) => (
              <div key={act.id} className="flex gap-6 p-6 rounded-[2rem] glass-card inner-glow group cursor-pointer lg:hover:shadow-[0_20px_40px_-15px_rgba(236,72,153,0.3)]">
                <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-2xl overflow-hidden relative shadow-2xl border border-white/10">
                  <ImageWithFallback
                    src={act.activityPicture?.media || NO_IMAGE}
                    alt={act.activityName}
                    fill
                    sizes="(max-width: 640px) 96px, 128px"
                    className="object-cover w-full h-full group-hover:scale-125 transition-transform duration-700"
                  />
                </div>
                
                <div className="flex flex-col py-1 flex-1 min-w-0">
                  <h4 className="text-xl font-black text-white truncate group-hover:text-emerald-400 transition-colors mb-2">
                    {act.activityName}
                  </h4>
                  <p className="text-sm text-slate-400 font-medium line-clamp-2 mb-4 leading-relaxed">
                    {act.description || 'Elevate your routine with this expertly crafted session.'}
                  </p>
                  
                  <div className="mt-auto space-y-3">
                    <div className="flex flex-col gap-2 text-xs font-bold text-slate-500">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-emerald-500/70" />
                        <span className="truncate">
                          {new Date(act.activityStartDateTime).toLocaleDateString([], { month: 'short', day: 'numeric'})} • {new Date(act.activityStartDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-blue-500/70" />
                        <span className="truncate text-slate-400">
                          {act.isOnline ? 'Digital Studio' : (act.activityLocation || 'City Center')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="text-sm font-black text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-xl border border-emerald-500/20 shadow-lg">
                        {act.activityCost === 0 ? 'Complimentary' : `$${act.activityCost}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="px-4 md:px-8 pb-12 pt-24 relative overflow-hidden">
        {/* Decorative footer glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        
        <footer className="glass rounded-[3rem] pt-20 pb-12 px-8 md:px-16 relative z-10 border border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
              <div className="col-span-1 md:col-span-2 space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                    <Star size={24} fill="white" className="text-white" />
                  </div>
                  <span className="font-black text-3xl tracking-tight text-white"><span className="text-gradient-vibrant">Experience</span> Portal</span>
                </div>
                <p className="text-slate-400 text-lg max-w-sm font-medium leading-relaxed">Defining the future of shared experiences. Join a global community of dreamers and doers.</p>
                <div className="flex gap-5 pt-4">
                  {[Activity, Star, Heart].map((Icon, i) => (
                    <div key={i} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-emerald-500 hover:text-[#020617] cursor-pointer transition-all hover:-translate-y-1">
                      <Icon size={24} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <h4 className="font-black text-xl text-white">Discover</h4>
                <ul className="space-y-4 text-slate-400 font-bold">
                  <li><a href="#" className="hover:text-emerald-400 transition-colors">Digital Gallery</a></li>
                  <li><a href="#" className="hover:text-emerald-400 transition-colors">Upcoming Thrills</a></li>
                  <li><a href="#" className="hover:text-emerald-400 transition-colors">World Tours</a></li>
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="font-black text-xl text-white">Connect</h4>
                <ul className="space-y-4 text-slate-400 font-bold">
                  <li><a href="#" className="hover:text-emerald-400 transition-colors">Our Vision</a></li>
                  <li><a href="#" className="hover:text-emerald-400 transition-colors">Ambassadors</a></li>
                  <li><a href="#" className="hover:text-emerald-400 transition-colors">Direct Support</a></li>
                </ul>
              </div>
            </div>
            <div className="text-center text-slate-500 font-bold text-sm pt-12 border-t border-white/5">
              &copy; 2026 Experience Portal • Handcrafted for the extraordinary.
            </div>
          </div>
        </footer>
      </div>

    </div>
  );
}


