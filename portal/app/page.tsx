import React from 'react';
import { Calendar, Users, Heart, MapPin, Activity, Star, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const mockExperiences = [
  {
    id: 30,
    title: "Nebula Music Festival",
    description: "Experience the ultimate electronic music festival with top DJs and immersive visuals.",
    likeCount: 1240,
    commentCount: 89,
    experienceStartDateTime: "2026-02-27T02:01:38.038Z",
    location: "135 W 41st St, New York, NY",
    color: { background_colour: "#00C853", button_bg_colour: "#001f2d" },
    expPicture: { media: "https://images.unsplash.com/photo-1540039155733-d7696c4bc9ff?q=80&w=1000&auto=format&fit=crop" },
    userDetail: { userName: "NebulaLive", profilePicture: { media: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" } }
  },
  {
    id: 31,
    title: "Oracle Tech Summit",
    description: "Deep dive into the future of cloud computing, AI, and enterprise architecture.",
    likeCount: 856,
    commentCount: 42,
    experienceStartDateTime: "2026-03-15T09:00:00.000Z",
    location: "Moscone Center, San Francisco, CA",
    color: { background_colour: "#00C853", button_bg_colour: "#001f2d" },
    expPicture: { media: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1000&auto=format&fit=crop" },
    userDetail: { userName: "OracleEvents", profilePicture: { media: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" } }
  }
];

const mockActivities = [
  {
    id: 1,
    activityName: "VIP Backstage Tour",
    description: "Exclusive access behind the scenes before the main event.",
    activityStartDateTime: "2026-02-27T18:00:00.000Z",
    activityCost: 150,
    activityLocation: "Main Stage Left",
    isOnline: false,
    activityPicture: { media: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000&auto=format&fit=crop" }
  },
  {
    id: 2,
    activityName: "Cloud Architecture Workshop",
    description: "Hands-on session with top engineers.",
    activityStartDateTime: "2026-03-15T11:00:00.000Z",
    activityCost: 0,
    activityLocation: "Room 3B",
    isOnline: true,
    activityPicture: { media: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1000&auto=format&fit=crop" }
  },
  {
    id: 3,
    activityName: "Afterparty Celebration",
    description: "Unwind and network with fellow attendees.",
    activityStartDateTime: "2026-02-28T02:00:00.000Z",
    activityCost: 50,
    activityLocation: "Rooftop Lounge",
    isOnline: false,
    activityPicture: { media: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000&auto=format&fit=crop" }
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-slate-900 pb-12 font-sans selection:bg-emerald-500/20">
      
      {/* Navbar for Landing Page */}
      <header className="fixed top-0 z-50 w-full bg-slate-950/20 backdrop-blur-md border-b border-white/10 transition-all duration-300">
        <div className="flex items-center justify-between h-20 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="font-bold text-xl tracking-tight text-white">Experience Portal</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-semibold text-white/90 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg transition-colors shadow-lg shadow-emerald-500/30">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner Section */}
      <div className="relative w-full h-screen min-h-[600px] flex flex-col justify-center mb-16 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=2000" 
          alt="Bright Event Conference" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Deep Navy to Transparent Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/80 to-slate-900/20"></div>
        
        <div className="relative z-10 flex flex-col justify-center px-8 md:px-16 max-w-4xl w-full pt-20 mx-auto lg:mx-0 xl:ml-32">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
            Discover extraordinary <br className="hidden md:block"/> experiences around you.
          </h1>
          <p className="text-slate-200 text-lg md:text-xl max-w-2xl font-medium mb-10">
            Join thousands of attendees and creators globally. Find your next adventure or host your own spectacular event.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/signup">
              <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 transition-colors font-bold text-lg text-white shadow-lg shadow-emerald-500/30 flex justify-center items-center gap-2 group">
                Create Event
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          
          {/* Top Experiences */}
          <div className="xl:col-span-2 space-y-6">
            <div className="flex justify-between items-center px-1">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                Trending Experiences
              </h2>
              <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                View all &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockExperiences.map((exp) => (
                <div key={exp.id} className="group relative rounded-2xl overflow-hidden bg-white border border-slate-200 transition-all duration-300 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/10 cursor-pointer">
                  <div className="aspect-[16/10] w-full relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={exp.expPicture.media} 
                      alt={exp.title}
                      className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    {/* Floating Date Badge */}
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-2">
                      <Calendar size={14} className="text-emerald-600" />
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                        {new Date(exp.experienceStartDateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                        {exp.title}
                      </h3>
                    </div>
                    
                    <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                      {exp.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                      <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-100">
                        <MapPin size={14} className="text-slate-400" /> 
                        <span className="truncate max-w-[120px]">{exp.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-100">
                        <Heart size={14} className="text-rose-500" /> {exp.likeCount}
                      </div>
                    </div>
                  </div>
                  
                  {/* Host Footer */}
                  <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={exp.userDetail.profilePicture.media} className="w-6 h-6 rounded-full object-cover" alt="Host" />
                    <span className="text-xs font-medium text-slate-500">Hosted by <span className="font-bold text-slate-700">{exp.userDetail.userName}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Best Activities */}
          <div className="space-y-6">
            <div className="flex justify-between items-center px-1">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                Upcoming Activities
              </h2>
            </div>

            <div className="flex flex-col gap-4">
              {mockActivities.map((act) => (
                <div key={act.id} className="flex gap-4 p-3 rounded-2xl bg-white border border-slate-200 hover:border-emerald-200 transition-all duration-200 group cursor-pointer shadow-sm hover:shadow-md">
                  <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden relative border border-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={act.activityPicture.media} alt={act.activityName} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  
                  <div className="flex flex-col py-1 flex-1 min-w-0 pr-2">
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <h4 className="text-base font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                        {act.activityName}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 mb-2">
                      {act.description}
                    </p>
                    
                    <div className="mt-auto flex justify-between items-end">
                      <div className="flex flex-col gap-1 text-[11px] font-semibold text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-emerald-500" />
                          <span className="text-slate-600">{new Date(act.activityStartDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin size={12} className="text-slate-400" />
                          <span className="text-slate-500 truncate">{act.isOnline ? 'Online Event' : act.activityLocation}</span>
                        </div>
                      </div>
                      
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-200 whitespace-nowrap">
                        {act.activityCost === 0 ? 'Free' : `$${act.activityCost}`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
          
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-200 bg-white pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center text-slate-500 text-sm">
          &copy; 2026 Experience Portal. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
