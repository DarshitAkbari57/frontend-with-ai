'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { ArrowLeft, CalendarDays, Globe, MapPin, UsersRound, Clock3, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useExperience } from '@/hooks/useExperience';
import type { Activity, Experience, Ticket } from '@/types/api';

type ActivityBucket = {
  groupActivities?: unknown;
  myActivities?: unknown;
};

function formatDateTime(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function normalizeActivities(experience: Experience): Activity[] {
  const rawActivities = (experience as Experience & { activities?: unknown }).activities;

  if (Array.isArray(rawActivities)) {
    return rawActivities as Activity[];
  }

  if (!rawActivities || typeof rawActivities !== 'object') {
    return [];
  }

  const bucket = rawActivities as ActivityBucket;
  const groupActivities = Array.isArray(bucket.groupActivities) ? bucket.groupActivities : [];
  const myActivities = Array.isArray(bucket.myActivities) ? bucket.myActivities : [];

  return [...groupActivities, ...myActivities].filter((item): item is Activity => {
    return typeof item === 'object' && item !== null && 'id' in item;
  });
}

function normalizeTickets(experience: Experience): Ticket[] {
  return Array.isArray(experience.tickets) ? experience.tickets : [];
}

export default function ExperienceDetailPage() {
  const params = useParams<{ id: string }>();
  const experienceId = Number(params?.id);
  const { data: experience, isLoading, error } = useExperience(
    Number.isFinite(experienceId) ? experienceId : undefined
  );

  if (!Number.isFinite(experienceId)) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Invalid experience ID</h1>
        <Button asChild variant="outline">
          <Link href="/experiences">Back to experiences</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-12 w-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="h-80 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="space-y-4">
            <div className="h-32 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-32 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !experience) {
    return (
      <div className="space-y-4 rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/30">
        <h1 className="text-xl font-semibold text-red-700 dark:text-red-200">Failed to load experience</h1>
        <p className="text-sm text-red-600 dark:text-red-300">
          {error?.message || 'The experience could not be loaded from backend.'}
        </p>
        <Button asChild variant="outline">
          <Link href="/experiences">Back to experiences</Link>
        </Button>
      </div>
    );
  }

  const activities = normalizeActivities(experience);
  const tickets = normalizeTickets(experience);

  const socialLinks = [
    { label: 'Instagram', href: experience.instagramUrl },
    { label: 'Twitter', href: experience.twitterUrl },
    { label: 'Facebook', href: experience.facebookUrl },
    { label: 'Google', href: experience.googleUrl },
  ].filter((item) => !!item.href);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href="/experiences">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to experiences
          </Link>
        </Button>
        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          Experience #{experience.id}
        </span>
        {experience.isOnline && (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            Online
          </span>
        )}
        {experience.isDisabled && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            Disabled
          </span>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="overflow-hidden border-zinc-200/80 dark:border-zinc-800">
          <div className="relative h-72 w-full bg-zinc-100 dark:bg-zinc-900">
            {experience.expPicture?.media ? (
              <Image
                src={experience.expPicture.media}
                alt={experience.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 70vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-100 via-zinc-200 to-zinc-300 text-sm font-medium text-zinc-500 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-700 dark:text-zinc-300">
                No cover image available
              </div>
            )}
          </div>
          <CardHeader>
            <CardTitle className="text-3xl tracking-tight">{experience.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm leading-6 text-zinc-700 dark:text-zinc-300">
              {experience.description || 'No description available.'}
            </p>

            <div className="grid gap-3 text-sm text-zinc-700 dark:text-zinc-300 sm:grid-cols-2">
              <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
                <CalendarDays className="h-4 w-4 text-zinc-500" />
                <span>{formatDateTime(experience.experienceStartDateTime)}</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
                <Clock3 className="h-4 w-4 text-zinc-500" />
                <span>{formatDateTime(experience.experienceEndDateTime)}</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
                <MapPin className="h-4 w-4 text-zinc-500" />
                <span className="line-clamp-1">{experience.location || experience.address || 'Location unavailable'}</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
                <UsersRound className="h-4 w-4 text-zinc-500" />
                <span>{experience.inviteDetails?.length ?? 0} invite(s)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-zinc-200/80 dark:border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Price</span>
                <span className="font-medium">
                  {experience.experienceCost > 0 ? `$${experience.experienceCost}` : 'Free'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Owner</span>
                <span className="font-medium">{experience.userDetail?.userName || `#${experience.experienceOwnerId}`}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Likes</span>
                <span className="font-medium">{experience.likeCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Comments</span>
                <span className="font-medium">{experience.commentCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Control</span>
                <span className="font-medium">{experience.controlBy}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200/80 dark:border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg">Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {experience.streamLink ? (
                <a
                  href={experience.streamLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline dark:text-blue-400"
                >
                  <Globe className="h-4 w-4" />
                  Open stream
                </a>
              ) : (
                <p className="text-sm text-zinc-500">No stream link available.</p>
              )}

              {socialLinks.length > 0 ? (
                socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href as string}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-zinc-700 hover:underline dark:text-zinc-300"
                  >
                    <Link2 className="h-4 w-4" />
                    {social.label}
                  </a>
                ))
              ) : (
                <p className="text-sm text-zinc-500">No social links available.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-zinc-200/80 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg">Related Activities</CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length > 0 ? (
              <div className="space-y-2">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <p className="font-medium">{activity.activityName}</p>
                    <p className="text-xs text-zinc-500">
                      {formatDateTime(activity.activityStartDateTime)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">No activities linked to this experience.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-200/80 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg">Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            {tickets.length > 0 ? (
              <div className="space-y-2">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <span className="font-medium">{ticket.name}</span>
                    <span>${ticket.price}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">No tickets available.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
