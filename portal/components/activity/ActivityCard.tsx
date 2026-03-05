'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import type { Activity } from '@/types/api';
import { CalendarDays, MapPin, UserRound, ArrowRight, Shield, Globe, Clock } from 'lucide-react';
import { deleteActivity, updateActivity } from '@/lib/api';

interface ActivityCardProps {
  activity: Activity;
}

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

function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export default function ActivityCard({ activity }: ActivityCardProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => deleteActivity(activity.id.toString()),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['activities'] });
      const queries = queryClient.getQueriesData<{ data: Activity[]; total: number; page: number; limit: number; totalPages: number }>({ queryKey: ['activities'] });
      queries.forEach(([queryKey, oldData]) => {
        if (oldData) {
          queryClient.setQueryData(queryKey, (old: any) => {
            if (!old) return old;
            return {
              ...old,
              data: old.data.filter((a: Activity) => a.id !== activity.id),
              total: old.total - 1,
            };
          });
        }
      });
      return { queries };
    },
    onError: (err, variables, context: any) => {
      context?.queries.forEach(([queryKey, oldData]: any) => {
        queryClient.setQueryData(queryKey, oldData);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast({
        title: deleteMutation.isError ? 'Error' : 'Success',
        description: deleteMutation.isError ? (deleteMutation.error as Error).message : 'Activity deleted',
        variant: deleteMutation.isError ? 'destructive' : 'default',
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: () => updateActivity(activity.id.toString(), { isDisabled: !activity.isDisabled }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['activities'] });
      await queryClient.cancelQueries({ queryKey: ['activity', activity.id] });
      const listQueries = queryClient.getQueriesData<{ data: Activity[]; total: number; page: number; limit: number; totalPages: number }>({ queryKey: ['activities'] });
      listQueries.forEach(([queryKey, oldData]) => {
        if (oldData) {
          queryClient.setQueryData(queryKey, (old: any) => {
            if (!old) return old;
            return {
              ...old,
              data: old.data.map((a: Activity) => (a.id === activity.id ? { ...a, isDisabled: !a.isDisabled } : a)),
            };
          });
        }
      });
      const prevSingle = queryClient.getQueryData<Activity>(['activity', activity.id]);
      queryClient.setQueryData<Activity>(['activity', activity.id], (old) => (old ? { ...old, isDisabled: !old.isDisabled } : old));
      return { prevSingle, listQueries };
    },
    onError: (err, variables, context: any) => {
      if (context?.prevSingle) {
        queryClient.setQueryData(['activity', context.prevSingle.id], context.prevSingle);
      }
      context?.listQueries.forEach(([queryKey, oldData]: any) => {
        queryClient.setQueryData(queryKey, oldData);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['activity', activity.id] });
      toast({
        title: toggleMutation.isError ? 'Error' : 'Success',
        description: toggleMutation.isError
          ? (toggleMutation.error as Error).message
          : activity.isDisabled
            ? 'Activity enabled'
            : 'Activity disabled',
        variant: toggleMutation.isError ? 'destructive' : 'default',
      });
    },
  });

  const costLabel = activity.activityCost > 0 ? `$${activity.activityCost}` : 'Free';

  return (
    <Link href={`/activities/${activity.id}`} className="block h-full">
      <Card className="group cursor-pointer overflow-hidden border-zinc-200/80 !py-0 !gap-0 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-zinc-800 h-full flex flex-col">
        <div className="relative h-32 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          {activity.activityPicture?.media ? (
            <img
              src={activity.activityPicture.media}
              alt={activity.activityName}
              className="h-full w-full object-cover"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                target.parentElement?.querySelector('[data-placeholder]')?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div
            data-placeholder
            className={`flex h-full items-center justify-center bg-gradient-to-br from-zinc-100 via-zinc-200 to-zinc-300 text-sm font-medium text-zinc-400 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-700 dark:text-zinc-500 ${activity.activityPicture?.media ? 'hidden absolute inset-0' : ''}`}
          >
            No image available
          </div>
          <div className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            {costLabel}
          </div>
          {activity.isOnline && (
            <div className="absolute right-3 top-3 rounded-full bg-emerald-500/90 px-2.5 py-1 text-xs font-semibold text-white">
              Online
            </div>
          )}
        </div>

        <CardHeader className="pb-3">
          <CardTitle className="line-clamp-1 text-lg">{activity.activityName}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 flex-1">
          <p className="line-clamp-2 min-h-10 text-sm text-zinc-600 dark:text-zinc-300">
            {activity.description || 'No description available.'}
          </p>

          <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
              <span className="line-clamp-1">{activity.address || activity.activityLocation || 'Location not provided'}</span>
            </div>
            <div className="flex items-start gap-2">
              <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
              <span className="line-clamp-1">{formatDate(activity.activityStartDateTime)}</span>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
              <span className="line-clamp-1">{activity.activityFor}</span>
            </div>
            <div className="flex items-start gap-2">
              <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
              <span className="mb-5 line-clamp-1">Creator #{activity.creatorId}</span>
            </div>
            {activity.ageGroups && activity.ageGroups !== 'All Age Group' && (
              <div className="mb-5 flex items-start gap-2">
                <Shield className="h-4 w-4 shrink-0 text-zinc-500" />
                <span className="line-clamp-1">{activity.ageGroups}</span>
              </div>
            )}
          </div>
        </CardContent>

      </Card>
    </Link>
  );
}
