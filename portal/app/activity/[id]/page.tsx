'use client';

import React, { useEffect, useState } from 'react';
import type { Activity } from '@/types/api';
import { Clock, User, ArrowLeft, Info, MapPin } from 'lucide-react';
import Link from 'next/link';
import ImageWithFallback from '@/components/ImageWithFallback';
import { useParams, useSearchParams } from 'next/navigation';
import { GetTicketsButton } from '@/components/GetTicketsButton';
import { ActivityTicketsSection } from '@/components/ActivityTicketsSection';

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

export default function ActivityDetailPage() {
  const params = useParams<{ id?: string | string[] }>();
  const searchParams = useSearchParams();

  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const activityId = Number.parseInt(rawId ?? '', 10);
  const timezone = searchParams.get('timezone') || 'UTC';
  const backHref = normalizeInternalPath(searchParams.get('from') || undefined) || '/activity';

  const [status, setStatus] = useState<LoadStatus>('loading');
  const [activity, setActivity] = useState<Activity | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!Number.isFinite(activityId)) {
      return;
    }

    let active = true;

    async function loadActivity() {
      setStatus('loading');
      setErrorMsg('');

      try {
        const response = await fetch(
          `/api/activity/public/${activityId}?timezone=${encodeURIComponent(timezone)}`,
          {
            method: 'GET',
          }
        );

        const payload = (await response.json().catch(() => ({}))) as Activity & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error || 'Failed to fetch activity details');
        }

        if (!active) {
          return;
        }

        setActivity(payload);
        setStatus('ready');
      } catch (error: unknown) {
        if (!active) {
          return;
        }
        setErrorMsg(error instanceof Error ? error.message : 'Failed to load activity');
        setStatus('error');
      }
    }

    loadActivity();
    return () => {
      active = false;
    };
  }, [activityId, timezone]);

  if (!Number.isFinite(activityId)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-2xl font-bold">
        <span>Invalid Activity ID</span>
        <Link
          href="/activity"
          className="px-6 py-3 bg-slate-900 text-white text-base font-semibold rounded-full hover:bg-slate-800 transition-colors"
        >
          Back to Activities
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

  if (status === 'error' || !activity) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-zinc-50 text-slate-800">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Activity Not Found</h2>
        <p className="text-slate-500 mb-8 max-w-md text-center">
          {errorMsg || 'We could not find the activity you were looking for.'}
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
    activity.activityPicture?.media ||
    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=2000';
  const isOnline = activity.isOnline;
  const loc = isOnline
    ? 'Online Activity'
    : activity.activityLocation || activity.address || 'Location TBA';

  const startDate = new Date(activity.activityStartDateTime);
  const endDate = new Date(activity.activityEndDateTime);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-slate-900 selection:bg-emerald-500/20">
      <main className="w-full relative min-h-screen">
        {/* Hero Section */}
        <div className="relative w-full h-[50vh] min-h-[400px]">
          <ImageWithFallback
            src={imageUrl}
            alt={activity.activityName}
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
              {activity.activityName}
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

        {/* Content */}
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-24 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
            {/* Left Column */}
            <div className="lg:col-span-7">
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Info className="text-emerald-500" /> About this activity
                </h2>
                <div className="prose prose-lg prose-slate max-w-none text-slate-600 leading-relaxed font-medium">
                  <p>{activity.description}</p>
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
                    Ends: {endDate.toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2 text-lg">
                    <MapPin size={18} className="text-slate-400" /> Location
                  </h3>
                  <p className="text-slate-600 font-medium">
                    {loc}
                  </p>
                </div>
              </section>

              <hr className="border-slate-200 my-8" />

              {/* Cost Info */}
              <section>
                <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2 text-lg">
                  Cost
                </h3>
                <p className="text-slate-600 font-medium">
                  {activity.activityCost === 0 ? 'Free' : `$${activity.activityCost}`}
                </p>
              </section>
            </div>

            {/* Right Column - Venue & Details */}
            <div className="lg:col-span-5 space-y-16">
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
                      {endDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}{' '}
                      at{' '}
                      {endDate.toLocaleTimeString('en-US', {
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
                        Online Activity.
                        <br />
                        Access link will be provided upon booking.
                      </p>
                    ) : (
                      <p>
                        {loc}
                        <br />
                        {activity.address}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tickets Section */}
          <ActivityTicketsSection activityId={activityId} />
        </div>
      </main>
    </div>
  );
}
