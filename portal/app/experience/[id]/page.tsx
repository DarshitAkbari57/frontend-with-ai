import React from 'react';
import { fetchPublic } from '@/lib/backend';
import type { Experience, Activity } from '@/types/api';
import { Heart, Clock, User, ArrowLeft, Info, Activity as ActivityIcon } from 'lucide-react';
import Link from 'next/link';
import { GetTicketsButton } from '@/components/GetTicketsButton';

export default async function ExperienceDetailPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams?: Promise<{ timezone?: string }> }) {
  const resolvedParams = await params;
  const resolvedSearch = searchParams ? await searchParams : {};
  const timezone = resolvedSearch.timezone || 'UTC';
  const experienceId = parseInt(resolvedParams.id, 10);

  if (isNaN(experienceId)) {
    return <div className="min-h-screen flex items-center justify-center text-2xl font-bold">Invalid Experience ID</div>;
  }

  let experience: Experience;
  try {
    experience = await fetchPublic<Experience>(`/experience/public/${experienceId}?timezone=${encodeURIComponent(timezone)}`);
  } catch (error) {
    console.error("Error fetching experience:", error);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-zinc-50 text-slate-800">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Experience Not Found</h2>
        <p className="text-slate-500 mb-8 max-w-md text-center">We couldn&apos;t find the experience you were looking for. It might have been removed or the ID is incorrect.</p>
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

  // Activities might be an array directly or an object containing groupActivities
  let activities: Activity[] = [];
  if (Array.isArray(experience.activities)) {
    activities = experience.activities;
  } else if (experience.activities && typeof experience.activities === 'object') {
    const groupActivities = Array.isArray((experience.activities as any).groupActivities) 
      ? (experience.activities as any).groupActivities 
      : [];
      
    // Flatten the groupActivities since they might be nested under `activity` property
    for (const group of groupActivities) {
      if (!group || typeof group !== 'object') continue;
      
      if (Array.isArray(group.activity) && group.activity.length > 0) {
        // Fallback times from parent group if needed
        const fallbackStart = group.startTime || group.activityStartDateTime;
        group.activity.forEach((act: any) => {
          activities.push({
            ...act,
            id: act.id || act.activityId,
            activityName: act.activityName || act.name || act.title || 'Untitled Activity',
            activityCost: act.activityCost ?? act.cost ?? 0,
            activityStartDateTime: act.activityStartDateTime || fallbackStart,
            activityPicture: act.activityPicture || act.picture || null,
          } as Activity);
        });
      } else {
        activities.push({
          ...group,
          id: group.id || group.activityId || group.sequenceNumber,
          activityName: group.activityName || group.name || group.title || 'Untitled Activity',
          activityCost: group.activityCost ?? group.cost ?? 0,
          activityStartDateTime: group.activityStartDateTime || group.startTime,
          activityPicture: group.activityPicture || group.picture || null,
        } as Activity);
      }
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-slate-900 selection:bg-emerald-500/20">
      <main className="w-full relative min-h-screen">

        {/* Hero */}
        <div className="relative w-full h-[50vh] min-h-[400px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={experience.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/60 mix-blend-multiply"></div>

          <div className="absolute top-8 left-4 md:left-12 z-10">
            <Link href="/" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-white transition-colors">
              <ArrowLeft size={20} />
            </Link>
          </div>

          <div className="absolute inset-0 flex flex-col items-center sm:items-start justify-center text-center sm:text-left p-8 md:px-24">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-light text-white uppercase tracking-[0.2em] mb-4">
              {experience.title}
            </h1>
            <p className="text-white/80 tracking-widest text-sm uppercase font-semibold mb-8">
              {startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} &bull; {loc}
            </p>
            <GetTicketsButton experienceId={experienceId} />
          </div>
        </div>

        {/* Content */}
        <div className="max-w-[1400px] mx-auto px-8 md:px-24 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">

            {/* Row 1 Left — About + Details */}
            <div className="lg:col-span-7">
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Info className="text-emerald-500" /> About this experience
                </h2>
                <div className="prose prose-lg prose-slate max-w-none text-slate-600 leading-relaxed font-medium">
                  <p>{experience.description}</p>
                </div>
              </section>

              <hr className="border-slate-200 my-8" />

              <section className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2 text-lg">
                    <Clock size={18} className="text-slate-400" /> Timing
                  </h3>
                  <p className="text-slate-600 font-medium">
                    Starts: {startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}<br />
                    Ends: {new Date(experience.experienceEndDateTime).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2 text-lg">
                    <User size={18} className="text-slate-400" /> Attendees
                  </h3>
                  <p className="text-slate-600 font-medium">
                    {experience.inviteDetails?.length || 0} People expected
                  </p>
                </div>
              </section>

              <hr className="border-slate-200 my-8" />

              {/* Activities */}
              <div>
                <h2 className="text-xl font-bold tracking-[0.2em] text-slate-900 uppercase mb-8">
                  Activities
                </h2>
                {activities.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activities.map((act) => (
                      <div key={act.id} className="flex flex-col group">
                        <div className="w-full aspect-square mb-4 overflow-hidden bg-slate-100 flex items-center justify-center relative">
                          {act.activityPicture?.media ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={act.activityPicture.media} alt={act.activityName} className="object-cover w-full h-full transition-all duration-700" />
                          ) : (
                            <ActivityIcon className="text-slate-300" size={48} />
                          )}
                          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex flex-col">
                            <span className="text-white font-bold text-lg leading-tight">{act.activityName}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-start text-sm">
                          <span className="text-slate-500 font-medium">
                            {new Date(act.activityStartDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-slate-900 font-bold uppercase tracking-wider text-xs">
                            {act.activityCost === 0 ? 'Free' : `$${act.activityCost}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-500 italic">No specific activity items available.</div>
                )}
              </div>
            </div>
            <div className="lg:col-span-5 space-y-16">

              <div>
                <h2 className="text-xl font-bold tracking-[0.2em] text-slate-900 uppercase mb-8">
                  Organizer
                </h2>
                <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-400 tracking-widest w-12 shrink-0">HOST</span>
                    <span className="font-bold text-slate-900 tracking-wide text-lg">{hostName}</span>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={hostAvatar} alt={hostName} className="w-10 h-10 rounded-full object-cover grayscale" />
                </div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4 opacity-50">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-400 tracking-widest w-12 shrink-0">MOD</span>
                    <span className="font-bold text-slate-900 tracking-wide">Community Team</span>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold tracking-[0.2em] text-slate-900 uppercase mb-8">
                  Venue
                </h2>
                <div className="text-slate-600 space-y-6 text-sm leading-loose">
                  <div>
                    <strong className="block text-slate-900 tracking-wider mb-1 uppercase text-xs">Dates</strong>
                    <p>Starts: {startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })} at {startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                    <p>Ends: {new Date(experience.experienceEndDateTime).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })} at {new Date(experience.experienceEndDateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div>
                    <strong className="block text-slate-900 tracking-wider mb-1 uppercase text-xs">Location</strong>
                    {isOnline ? (
                      <p>Online Experience.<br />Access link will be provided upon booking.</p>
                    ) : (
                      <p>{loc}<br />{experience.address}</p>
                    )}
                  </div>
                  <div>
                    <strong className="block text-slate-900 tracking-wider mb-1 uppercase text-xs">Engagement</strong>
                    <p className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5"><User size={14} /> {experience.inviteDetails?.length || 0} Expected</span>
                      <span className="flex items-center gap-1.5 text-rose-500"><Heart size={14} /> {experience.likeCount} Likes</span>
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
