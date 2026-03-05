'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';
import { useActivity } from '@/hooks/useActivity';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateActivity, deleteActivity } from '@/services/activityService';
import type { Activity } from '@/types/api';

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
  const id = params.id as string;
  const activityId = parseInt(id, 10);

  const { data: activity, isLoading, error } = useActivity({ id: activityId });
  const queryClient = useQueryClient();

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

  const toggleMutation = useMutation({
    mutationFn: () => updateActivity(activityId, { isDisabled: !activity?.isDisabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity', activityId] });
      toast({
        title: 'Success',
        description: activity?.isDisabled ? 'Activity enabled' : 'Activity disabled',
        variant: 'default',
      });
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: (err as Error).message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteActivity(activityId),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Activity deleted successfully',
        variant: 'default',
      });
      // Redirect to activities page after deletion
      setTimeout(() => {
        window.location.href = '/activities';
      }, 500);
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: (err as Error).message,
        variant: 'destructive',
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
          <Link href="/activities">
            <Button variant="outline">Back to Activities</Button>
          </Link>
        </div>
        <div className="grid gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-6 space-y-4 animate-pulse bg-white dark:bg-zinc-800 dark:border-zinc-700">
              <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4"></div>
              <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Activity Not Found</h1>
          <Link href="/activities">
            <Button variant="outline">Back to Activities</Button>
          </Link>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-zinc-600 dark:text-zinc-400">The activity you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{activity.activityName}</h1>
        <Link href="/activities">
          <Button variant="outline">Back to Activities</Button>
        </Link>
      </div>

      {/* Activity Image */}
      <div className="w-full h-64 md:h-80 rounded-lg overflow-hidden">
        {activity.activityPicture?.media ? (
          <img
            src={activity.activityPicture.media}
            alt={activity.activityName}
            className="h-full w-full object-fill"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-100 via-zinc-200 to-zinc-300 text-sm font-medium text-zinc-400 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-700 dark:text-zinc-500">
            No image available
          </div>
        )}
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Description</h3>
            <p className="mt-1 text-base">{activity.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Cost</h3>
              <p className="mt-1 text-base">{activity.activityCost === 0 ? 'Free' : `$${activity.activityCost}`}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Activity Type</h3>
              <p className="mt-1 text-base">{activity.activityFor}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Start Date & Time</h3>
              <p className="mt-1 text-base">{formatDateTime(activity.activityStartDateTime)}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">End Date & Time</h3>
              <p className="mt-1 text-base">{formatDateTime(activity.activityEndDateTime)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location & Details */}
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Address</h3>
              <p className="mt-1 text-base">{activity.address || 'No address'}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Location</h3>
              <p className="mt-1 text-base">{activity.activityLocation || 'No location'}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Format</h3>
              <p className="mt-1 text-base">{activity.isOnline ? 'Online' : 'Offline'}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Control By</h3>
              <p className="mt-1 text-base">{activity.controlBy}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Age Groups</h3>
              <p className="mt-1 text-base">{activity.ageGroups || 'All Age Group'}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Status</h3>
              <p className="mt-1 text-base">
                {activity.isDisabled ? (
                  <span className="text-red-600 dark:text-red-400">Disabled</span>
                ) : (
                  <span className="text-green-600 dark:text-green-400">Enabled</span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Experience Connection */}
      {activity.experienceId && (
        <Card>
          <CardHeader>
            <CardTitle>Related Experience</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href={`/experiences/${activity.experienceId}`} className="text-blue-600 hover:underline">
              View Experience ID: {activity.experienceId}
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Social Links */}
      {(activity.instagramUrl || activity.twitterUrl || activity.facebookUrl || activity.googleUrl) && (
        <Card>
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {activity.instagramUrl && (
              <p>
                <a href={activity.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Instagram
                </a>
              </p>
            )}
            {activity.twitterUrl && (
              <p>
                <a href={activity.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Twitter
                </a>
              </p>
            )}
            {activity.facebookUrl && (
              <p>
                <a href={activity.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Facebook
                </a>
              </p>
            )}
            {activity.googleUrl && (
              <p>
                <a href={activity.googleUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Google
                </a>
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stream Link */}
      {activity.streamLink && (
        <Card>
          <CardHeader>
            <CardTitle>Stream Link</CardTitle>
          </CardHeader>
          <CardContent>
            <a href={activity.streamLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
              {activity.streamLink}
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
}