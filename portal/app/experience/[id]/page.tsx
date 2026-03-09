import React from 'react';
import { fetchFromBackend } from '@/lib/backend';
import type { Experience } from '@/types/api';
import { Calendar, MapPin, Heart, Clock, User, ArrowLeft, ArrowRight, Info } from 'lucide-react';
import Link from 'next/link';
import { TicketBookingForm } from '@/components/TicketBookingForm';

export default async function ExperienceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const experienceId = parseInt(resolvedParams.id, 10);
  
  if (isNaN(experienceId)) {
    return <div className="min-h-screen flex items-center justify-center text-2xl font-bold">Invalid Experience ID</div>;
  }

  let experience: Experience;
  try {
    experience = await fetchFromBackend<Experience>(`/experience/${experienceId}`);
  } catch (error) {
    console.error("Error fetching experience:", error);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-zinc-50 text-slate-800">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Experience Not Found</h2>
        <p className="text-slate-500 mb-8 max-w-md text-center">We couldn't find the experience you were looking for. It might have been removed or the ID is incorrect.</p>
        <Link href="/">
          <button className="px-6 py-3 bg-slate-900 text-white font-bold rounded-full hover:bg-slate-800 transition-colors">
            Return to Home
          </button>
        </Link>
      </div>
    );
  }

  // Fallbacks for missing data
  const imageUrl = experience.expPicture?.media || 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=2000';
  const hostName = experience.userDetail?.userName || 'Unknown Host';
  const hostAvatar = experience.userDetail?.profilePicture?.media || `https://ui-avatars.com/api/?name=${encodeURIComponent(hostName)}&background=random`;
  
  const startDate = new Date(experience.experienceStartDateTime);
  const isOnline = experience.isOnline;
  const loc = isOnline ? 'Online Experience' : (experience.location || experience.address || 'Location TBA');

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-slate-900 selection:bg-emerald-500/20">
      
      {/* Dynamic Navbar */}
      <header className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/50 transition-all duration-300">
        <div className="flex items-center justify-between h-20 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium">
              <ArrowLeft size={20} /> <span className="hidden sm:inline">Back to experiences</span>
            </Link>
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 absolute left-1/2 -translate-x-1/2 hidden md:block">
            Portal
          </span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-rose-50 px-4 py-2 rounded-full border border-rose-100">
              <Heart size={18} className="text-rose-500 fill-rose-500/20" />
              <span className="font-bold text-rose-700">{experience.likeCount}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Space */}
      <main className="pt-28 pb-24 md:pt-32 relative">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          {/* Header Banner - Hero */}
          <div className="relative w-full aspect-[21/9] md:aspect-[21/7] rounded-[2rem] overflow-hidden shadow-2xl shadow-emerald-900/5 mb-12 border-4 border-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={imageUrl} 
              alt={experience.title} 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-3xl">
                <div className="flex gap-3 mb-4 flex-wrap">
                  {isOnline && (
                    <span className="px-3 py-1 bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-md">Live Online</span>
                  )}
                  {experience.experienceCost === 0 && (
                    <span className="px-3 py-1 bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-md">Free</span>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4 tracking-tight drop-shadow-md">
                  {experience.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-6 text-slate-200 font-medium">
                  <div className="flex items-center gap-2">
                    <Calendar className="text-emerald-400" size={20} />
                    <span>{startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="text-emerald-400" size={20} />
                    <span>{loc}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            
            {/* Left Column - Details */}
            <div className="lg:col-span-7 space-y-12">
              
              {/* Host Banner */}
              <div className="flex items-center justify-between p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={hostAvatar} alt={hostName} className="w-14 h-14 rounded-full object-cover shadow-sm bg-slate-100" />
                  <div>
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Hosted By</p>
                    <p className="text-xl font-bold text-slate-900">{hostName}</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors">
                  Contact
                </button>
              </div>

              {/* About Section */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Info className="text-emerald-500" /> About this experience
                </h2>
                <div className="prose prose-lg prose-slate max-w-none text-slate-600 leading-relaxed font-medium">
                  <p>{experience.description}</p>
                </div>
              </section>
              
              <hr className="border-slate-200" />

              {/* Additional Details */}
              <section className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2 text-lg"><Clock size={18} className="text-slate-400"/> Timing</h3>
                  <p className="text-slate-600 font-medium">
                    Starts: {startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}<br/>
                    Ends: {new Date(experience.experienceEndDateTime).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2 text-lg"><User size={18} className="text-slate-400"/> Attendees</h3>
                  <p className="text-slate-600 font-medium">
                    {experience.inviteDetails?.length || 0} People expected
                  </p>
                </div>
              </section>

            </div>

            {/* Right Column - Booking Widget */}
            <div className="lg:col-span-5 relative">
              <TicketBookingForm experienceName={experience.title} />
            </div>

          </div>
        </div>
      </main>

    </div>
  );
}
