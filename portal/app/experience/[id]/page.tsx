'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { Experience, Activity } from '@/types/api';
import { Heart, Clock, User, ArrowLeft, Info } from 'lucide-react';
import Link from 'next/link';
import ImageWithFallback from '@/components/ImageWithFallback';
import { useParams, useSearchParams } from 'next/navigation';
import { GetTicketsButton } from '@/components/GetTicketsButton';
import { TicketsSection } from '@/components/TicketsSection';
import { ActivitiesSlider } from '@/components/ActivitiesSlider';

function normalizeInternalPath(value?: string): string | null {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed || !trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return null;
  }
  return trimmed;
}

type LoadStatus = 'loading' | 'ready' | 'error';

function normalizeActivities(experience: Experience): Activity[] {
  if (Array.isArray(experience.activities)) {
    return experience.activities;
  }

  if (!experience.activities || typeof experience.activities !== 'object') {
    return [];
  }

  const groupActivitiesCandidate = (experience.activities as { groupActivities?: unknown }).groupActivities;
  if (!Array.isArray(groupActivitiesCandidate)) {
    return [];
  }

  const activities: Activity[] = [];

  for (const groupEntry of groupActivitiesCandidate) {
    if (!groupEntry || typeof groupEntry !== 'object') {
      continue;
    }

    const group = groupEntry as Record<string, unknown>;
    const nestedActivities = group.activity;

    if (Array.isArray(nestedActivities) && nestedActivities.length > 0) {
      const fallbackStart =
        typeof group.startTime === 'string'
          ? group.startTime
          : typeof group.activityStartDateTime === 'string'
          ? group.activityStartDateTime
          : undefined;
      const fallbackEnd =
        typeof group.endTime === 'string'
          ? group.endTime
          : typeof group.activityEndDateTime === 'string'
          ? group.activityEndDateTime
          : undefined;

      for (const nestedItem of nestedActivities) {
        if (!nestedItem || typeof nestedItem !== 'object') {
          continue;
        }

        const act = nestedItem as Record<string, unknown>;
        activities.push({
          ...(act as unknown as Activity),
          id:
            typeof act.id === 'number'
              ? act.id
              : Number.isFinite(Number(act.activityId))
              ? Number(act.activityId)
              : 0,
          activityName:
            (typeof act.activityName === 'string' && act.activityName) ||
            (typeof act.name === 'string' && act.name) ||
            (typeof act.title === 'string' && act.title) ||
            'Untitled Activity',
          description: typeof act.description === 'string' ? act.description : '',
          activityCost:
            typeof act.activityCost === 'number'
              ? act.activityCost
              : typeof act.cost === 'number'
              ? act.cost
              : 0,
          activityStartDateTime:
            (typeof act.activityStartDateTime === 'string' && act.activityStartDateTime) ||
            fallbackStart ||
            '',
          activityEndDateTime:
            (typeof act.activityEndDateTime === 'string' && act.activityEndDateTime) ||
            (typeof act.endTime === 'string' && act.endTime) ||
            fallbackEnd ||
            '',
          activityPicture:
            act.activityPicture && typeof act.activityPicture === 'object'
              ? (act.activityPicture as Activity['activityPicture'])
              : act.picture && typeof act.picture === 'object'
              ? (act.picture as Activity['activityPicture'])
              : null,
        });
      }

      continue;
    }

    activities.push({
      ...(group as unknown as Activity),
      id:
        typeof group.id === 'number'
          ? group.id
          : Number.isFinite(Number(group.activityId))
          ? Number(group.activityId)
          : Number.isFinite(Number(group.sequenceNumber))
          ? Number(group.sequenceNumber)
          : 0,
      activityName:
        (typeof group.activityName === 'string' && group.activityName) ||
        (typeof group.name === 'string' && group.name) ||
        (typeof group.title === 'string' && group.title) ||
        'Untitled Activity',
      description: typeof group.description === 'string' ? group.description : '',
      activityCost:
        typeof group.activityCost === 'number'
          ? group.activityCost
          : typeof group.cost === 'number'
          ? group.cost
          : 0,
      activityStartDateTime:
        (typeof group.activityStartDateTime === 'string' && group.activityStartDateTime) ||
        (typeof group.startTime === 'string' && group.startTime) ||
        '',
      activityEndDateTime:
        (typeof group.activityEndDateTime === 'string' && group.activityEndDateTime) ||
        (typeof group.endTime === 'string' && group.endTime) ||
        '',
      activityPicture:
        group.activityPicture && typeof group.activityPicture === 'object'
          ? (group.activityPicture as Activity['activityPicture'])
          : group.picture && typeof group.picture === 'object'
          ? (group.picture as Activity['activityPicture'])
          : null,
    });
  }

  return activities;
}

export default function ExperienceDetailPage() {
  const params = useParams<{ id?: string | string[] }>();
  const searchParams = useSearchParams();

  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const experienceId = Number.parseInt(rawId ?? '', 10);
  const timezone = searchParams.get('timezone') || 'UTC';
  const backHref = normalizeInternalPath(searchParams.get('from') || undefined) || '/experience';

  const [status, setStatus] = useState<LoadStatus>('loading');
  const [experience, setExperience] = useState<Experience | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!Number.isFinite(experienceId)) {
      return;
    }

    let active = true;

    async function loadExperience() {
      setStatus('loading');
      setErrorMsg('');

      try {
        const response = await fetch(
          `/api/experience/public/${experienceId}?timezone=${encodeURIComponent(timezone)}`,
          {
            method: 'GET',
          }
        );

        const payload = (await response.json().catch(() => ({}))) as Experience & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error || 'Failed to fetch experience details');
        }

        if (!active) {
          return;
        }

        setExperience(payload);
        setStatus('ready');
      } catch (error: unknown) {
        if (!active) {
          return;
        }
        setErrorMsg(error instanceof Error ? error.message : 'Failed to load experience');
        setStatus('error');
      }
    }

    loadExperience();
    return () => {
      active = false;
    };
  }, [experienceId, timezone]);

  const activities = useMemo(() => {
    if (!experience) {
      return [];
    }
    return normalizeActivities(experience);
  }, [experience]);

  if (!Number.isFinite(experienceId)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-2xl font-bold">
        <span>Invalid Experience ID</span>
        <Link
          href="/experience"
          className="px-6 py-3 bg-slate-900 text-white text-base font-semibold rounded-full hover:bg-slate-800 transition-colors"
        >
          Back to Experiences
        </Link>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-zinc-50 font-sans text-slate-900 selection:bg-emerald-500/20">
        <main className="w-full relative min-h-screen">
          <div className="relative w-full h-[50vh] min-h-[320px] bg-slate-200 animate-pulse">
            <div className="absolute top-8 left-4 md:left-12 z-10">
              <Link
                href={backHref}
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/70 border border-white/80 hover:bg-white text-slate-900 transition-colors"
              >
                <ArrowLeft size={20} />
              </Link>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-300 border-t-emerald-500" />
            </div>
          </div>

          <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-24 py-16 space-y-5">
            <div className="h-9 w-2/3 bg-slate-200 rounded animate-pulse" />
            <div className="h-5 w-full bg-slate-200 rounded animate-pulse" />
            <div className="h-5 w-5/6 bg-slate-200 rounded animate-pulse" />
            <div className="h-5 w-4/5 bg-slate-200 rounded animate-pulse" />
          </div>
        </main>
      </div>
    );
  }

  if (status === 'error' || !experience) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-zinc-50 text-slate-800">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Experience Not Found</h2>
        <p className="text-slate-500 mb-8 max-w-md text-center">
          {errorMsg || 'We could not find the experience you were looking for.'}
        </p>
        <Link
          href={backHref}
          className="px-6 py-3 bg-slate-900 text-white font-bold rounded-full hover:bg-slate-800 transition-colors"
        >
          Go Back
        </Link>
      </div>
    );
  }

  const imageUrl =
    experience.expPicture?.media ||
    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=2000';
  const hostName = experience.userDetail?.userName || 'Unknown Host';
  const hostAvatar =
    experience.userDetail?.profilePicture?.media ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(hostName)}&background=random`;

  const startDate = new Date(experience.experienceStartDateTime);
  const isOnline = experience.isOnline;
  const loc = isOnline
    ? 'Online Experience'
    : experience.location || experience.address || 'Location TBA';

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-slate-900 selection:bg-emerald-500/20">
      <main className="w-full relative min-h-screen">
        <div className="relative w-full h-[50vh] min-h-[400px]">
          <ImageWithFallback
            src={imageUrl}
            alt={experience.title}
            fill
            priority
            sizes="100vw"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/60 mix-blend-multiply" />

          <div className="absolute top-8 left-4 md:left-12 z-10">
            <Link
              href={backHref}
              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-white transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
          </div>

          <div className="absolute inset-0 flex flex-col items-center sm:items-start justify-center text-center sm:text-left p-8 sm:px-8 lg:px-24">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-light text-white uppercase tracking-[0.12em] sm:tracking-[0.18em] mb-4">
              {experience.title}
            </h1>
            <p className="text-white/80 tracking-widest text-sm uppercase font-semibold mb-8">
              {startDate.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}{' '}
              &bull; {loc}
            </p>
            <GetTicketsButton />
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-24 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
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
                    Starts:{' '}
                    {startDate.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    <br />
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

              <ActivitiesSlider activities={activities} />
            </div>
            <div className="lg:col-span-5 space-y-16">
              <div>
                <h2 className="text-xl font-bold tracking-[0.12em] sm:tracking-[0.2em] text-slate-900 uppercase mb-8">
                  Organizer
                </h2>
                <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-400 tracking-widest w-12 shrink-0">
                      HOST
                    </span>
                    <span className="font-bold text-slate-900 tracking-wide text-lg">
                      {hostName}
                    </span>
                  </div>
                  <ImageWithFallback
                    src={hostAvatar}
                    alt={hostName}
                    width={40}
                    height={40}
                    sizes="40px"
                    className="w-10 h-10 rounded-full object-cover grayscale"
                  />
                </div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4 opacity-50">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-400 tracking-widest w-12 shrink-0">
                      MOD
                    </span>
                    <span className="font-bold text-slate-900 tracking-wide">
                      Community Team
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold tracking-[0.12em] sm:tracking-[0.2em] text-slate-900 uppercase mb-8">
                  Venue
                </h2>
                <div className="text-slate-600 space-y-6 text-sm leading-loose">
                  <div>
                    <strong className="block text-slate-900 tracking-wider mb-1 uppercase text-xs">
                      Dates
                    </strong>
                    <p>
                      Starts:{' '}
                      {startDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}{' '}
                      at{' '}
                      {startDate.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p>
                      Ends:{' '}
                      {new Date(experience.experienceEndDateTime).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}{' '}
                      at{' '}
                      {new Date(experience.experienceEndDateTime).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div>
                    <strong className="block text-slate-900 tracking-wider mb-1 uppercase text-xs">
                      Location
                    </strong>
                    {isOnline ? (
                      <p>
                        Online Experience.
                        <br />
                        Access link will be provided upon booking.
                      </p>
                    ) : (
                      <p>
                        {loc}
                        <br />
                        {experience.address}
                      </p>
                    )}
                  </div>
                  <div>
                    <strong className="block text-slate-900 tracking-wider mb-1 uppercase text-xs">
                      Engagement
                    </strong>
                    <p className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5">
                        <User size={14} /> {experience.inviteDetails?.length || 0} Expected
                      </span>
                      <span className="flex items-center gap-1.5 text-rose-500">
                        <Heart size={14} /> {experience.likeCount} Likes
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <TicketsSection experienceId={experienceId} />
        </div>
      </main>
    </div>
  );
}
