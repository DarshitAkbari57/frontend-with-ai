'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getActivities, getActivityById, deleteActivity, updateActivity } from '@/services/activityService';
import type { Activity, PaginatedResponse } from '@/types/api';
export function useActivities(params?: {
  page?: number;
  limit?: number;
  experienceId?: number;
}) {
  return useQuery({
    queryKey: ['activities', params],
    queryFn: () => getActivities(params),
  });
}

export function useActivity(id: number) {
  return useQuery({
    queryKey: ['activity', id],
    queryFn: () => getActivityById(id),
    enabled: !!id,
  });
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteActivity,
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ['activities'] });
      await queryClient.cancelQueries({ queryKey: ['activity', id] });

      const listQueries = queryClient.getQueriesData<PaginatedResponse<Activity>>({ queryKey: ['activities'] });
      listQueries.forEach(([queryKey, oldData]) => {
        if (oldData) {
          queryClient.setQueryData(queryKey, (old: any) => {
            if (!old) return old;
            return {
              ...old,
              data: old.data.filter((a: Activity) => a.id !== id),
              total: old.total - 1,
            };
          });
        }
      });

      const prevSingle = queryClient.getQueryData<Activity>(['activity', id]);
      queryClient.setQueryData<Activity>(['activity', id], () => undefined);

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
    onSettled: (id) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['activity', id] });
    },
  });
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Activity> }) => updateActivity(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['activities'] });
      await queryClient.cancelQueries({ queryKey: ['activity', id] });

      const listQueries = queryClient.getQueriesData<PaginatedResponse<Activity>>({ queryKey: ['activities'] });
      listQueries.forEach(([queryKey, oldData]) => {
        if (oldData) {
          queryClient.setQueryData(queryKey, (old: any) => {
            if (!old) return old;
            return {
              ...old,
              data: old.data.map((a: Activity) => (a.id === id ? { ...a, ...updates } : a)),
            };
          });
        }
      });

      const prevSingle = queryClient.getQueryData<Activity>(['activity', id]);
      queryClient.setQueryData<Activity>(['activity', id], (old) => (old ? { ...old, ...updates } : old));

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
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['activity', id] });
    },
  });
}
