'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, CalendarDays, Globe, MapPin, UsersRound, Clock3, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';
import { useActivity } from '@/hooks/useActivity';

function formatDateTime(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return 'Invalid date';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export default function ActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const activityId = parseInt(id, 10);
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);

  const { data: activity, isLoading, error } = useActivity({ id: activityId });

  // Show error if any
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [error]);



  const handleBackToActivities = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push('/activities');
  };

  if (Number.isNaN(activityId)) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Invalid activity ID</h1>
        <Button asChild variant="outline">
          <Link href="/activities">Back to activities</Link>
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

  if (error || !activity) {
    return (
      <div className="space-y-4 rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/30">
        <h1 className="text-xl font-semibold text-red-700 dark:text-red-200">Failed to load activity</h1>
        <p className="text-sm text-red-600 dark:text-red-300">
          The activity you're looking for doesn't exist or could not be loaded.
        </p>
        <Button asChild variant="outline">
          <Link href="/activities">Back to activities</Link>
        </Button>
      </div>
    );
  }

  const imageUrl = activity.activityPicture?.media ?? null;
  const shouldShowImage = Boolean(imageUrl) && failedImageUrl !== imageUrl;

  const socialLinks = [
    { label: 'Instagram', href: activity.instagramUrl },
    { label: 'Twitter', href: activity.twitterUrl },
    { label: 'Facebook', href: activity.facebookUrl },
    { label: 'Google', href: activity.googleUrl },
  ].filter((item) => !!item.href);

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" onClick={handleBackToActivities}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to activities
        </Button>
        {activity.isOnline && (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            Online
          </span>
        )}
        {activity.isDisabled && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            Disabled
          </span>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="overflow-hidden border-zinc-200/80 pt-0 dark:border-zinc-800">
          <div className="relative h-72 w-full bg-zinc-100 dark:bg-zinc-900">
            {shouldShowImage ? (
              <Image
                src={imageUrl as string}
                alt={activity.activityName}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 70vw"
                unoptimized
                onError={() => setFailedImageUrl(imageUrl as string)}
                className="object-full"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-linear-to-br from-zinc-100 via-zinc-200 to-zinc-300 text-sm font-medium text-zinc-500 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-700 dark:text-zinc-300">
                No cover image available
              </div>
            )}
          </div>
          <CardHeader>
            <CardTitle className="text-3xl tracking-tight">{activity.activityName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm leading-6 text-zinc-700 dark:text-zinc-300">
              {activity.description || 'No description available.'}
            </p>

            <div className="grid gap-3 text-sm text-zinc-700 dark:text-zinc-300 sm:grid-cols-2">
              <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
                <CalendarDays className="h-4 w-4 text-zinc-500" />
                <span>{formatDateTime(activity.activityStartDateTime)}</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
                <Clock3 className="h-4 w-4 text-zinc-500" />
                <span>{formatDateTime(activity.activityEndDateTime)}</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
                <MapPin className="h-4 w-4 text-zinc-500" />
                <span className="line-clamp-1">{activity.activityLocation || activity.address || 'Location unavailable'}</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
                <UsersRound className="h-4 w-4 text-zinc-500" />
                <span>{activity.activityFor || 'All Types'}</span>
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
                  {activity.activityCost > 0 ? `$${activity.activityCost}` : 'Free'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Format</span>
                <span className="font-medium">{activity.isOnline ? 'Online' : 'Offline'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Status</span>
                <span className="font-medium">{activity.isDisabled ? 'Disabled' : 'Active'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Age Groups</span>
                <span className="font-medium">{activity.ageGroups || 'All'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Control</span>
                <span className="font-medium">{activity.controlBy || '-'}</span>
              </div>
              {activity.age > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Minimum Age</span>
                  <span className="font-medium">{activity.age}+</span>
                </div>
              )}
            </CardContent>
          </Card>

          {(activity.includes && activity.includes !== '-') || (activity.promo && activity.promo !== '-') ? (
            <Card className="border-zinc-200/80 dark:border-zinc-800">
              <CardHeader>
                <CardTitle className="text-lg">Additional Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {activity.includes && activity.includes !== '-' && (
                  <div>
                    <span className="mb-1 block text-zinc-500">What's Included</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{activity.includes}</span>
                  </div>
                )}
                {activity.promo && activity.promo !== '-' && (
                  <div>
                    <span className="mb-1 block text-zinc-500">Promo / Offers</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">{activity.promo}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}

          <Card className="border-zinc-200/80 dark:border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg">Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {activity.streamLink ? (
                <a
                  href={activity.streamLink}
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

      {activity.experienceId && (
        <div className="flex h-full w-full">
          {/* 1. 'flex' on the wrapper allows the Card to stretch.
      2. 'h-full' ensures it looks at the parent's height.
    */}
          <Card className="flex w-full flex-col border-zinc-200/80 dark:border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg">Related Experience</CardTitle>
            </CardHeader>

            {/* 'flex-1' makes the CardContent expand to fill all 
        remaining vertical space inside the Card.
      */}
            <CardContent className="flex flex-1 items-stretch pb-6">
              <Link
                href={`/experiences/${activity.experienceId}`}
                className="group flex w-full items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-4 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/80"
              >
                <div className="space-y-1">
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    Experience #{activity.experienceId}
                  </p>
                  <p className="text-sm text-zinc-500">
                    View related experience details
                  </p>
                </div>

                <ArrowLeft className="h-4 w-4 rotate-180 text-zinc-400 transition-transform group-hover:translate-x-1 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
              </Link>
            </CardContent>
          </Card>
        </div>
      )}


    </div>
  );
}