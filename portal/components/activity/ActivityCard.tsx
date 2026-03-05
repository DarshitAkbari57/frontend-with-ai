'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import type { Activity } from '@/types/api';
import { deleteActivity, updateActivity } from '@/services/activityService';

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

export default function ActivityCard({ activity }: ActivityCardProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => deleteActivity(activity.id),
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
    mutationFn: () => updateActivity(activity.id, { isDisabled: !activity.isDisabled }),
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

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <Link href={`/activities/${activity.id}`} className="block">
        <CardHeader>
          <CardTitle className="truncate hover:text-blue-600">{activity.activityName}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-600 line-clamp-2">{activity.description}</p>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="truncate">{activity.address || 'No address'}</span>
            <span>{activity.activityCost === 0 ? 'Free' : `$${activity.activityCost}`}</span>
          </div>
          <div className="mt-2 text-sm text-zinc-500">
            {formatDateTime(activity.activityStartDateTime)}
          </div>
          {activity.isOnline && (
            <div className="mt-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
              Online
            </div>
          )}
        </CardContent>
      </Link>
      {activity.isAdmin && (
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => toggleMutation.mutate()} disabled={toggleMutation.isPending}>
              {toggleMutation.isPending ? 'Updating...' : activity.isDisabled ? 'Enable' : 'Disable'}
            </Button>
            <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
