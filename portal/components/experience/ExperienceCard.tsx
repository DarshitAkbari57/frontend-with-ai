'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import type { Experience, PaginatedResponse } from '@/types/api';
import { deleteExperience, updateExperience } from '@/services/experienceService';

interface ExperienceCardProps {
  experience: Experience;
}

export default function ExperienceCard({ experience }: ExperienceCardProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => deleteExperience(experience.id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['experiences'] });
      const queries = queryClient.getQueriesData<PaginatedResponse<Experience>>({ queryKey: ['experiences'] });
      queries.forEach(([queryKey, oldData]) => {
        if (oldData) {
          queryClient.setQueryData<PaginatedResponse<Experience>>(queryKey, (old) => {
            if (!old) return old;
            return {
              ...old,
              data: old.data.filter((e) => e.id !== experience.id),
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
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
      toast({
        title: deleteMutation.isError ? 'Error' : 'Success',
        description: deleteMutation.isError ? (deleteMutation.error as Error).message : 'Experience deleted',
        variant: deleteMutation.isError ? 'destructive' : 'default',
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: () => updateExperience(experience.id, { isDisabled: !experience.isDisabled }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['experiences'] });
      await queryClient.cancelQueries({ queryKey: ['experience', experience.id] });
      const listQueries = queryClient.getQueriesData<PaginatedResponse<Experience>>({ queryKey: ['experiences'] });
      listQueries.forEach(([queryKey, oldData]) => {
        if (oldData) {
          queryClient.setQueryData<PaginatedResponse<Experience>>(queryKey, (old) => {
            if (!old) return old;
            return {
              ...old,
              data: old.data.map((e) =>
                e.id === experience.id ? { ...e, isDisabled: !e.isDisabled } : e
              ),
            };
          });
        }
      });
      const prevSingle = queryClient.getQueryData<Experience>(['experience', experience.id]);
      queryClient.setQueryData<Experience>(['experience', experience.id], (old) =>
        old ? { ...old, isDisabled: !old.isDisabled } : old
      );
      return { prevSingle, listQueries };
    },
    onError: (err, variables, context: any) => {
      if (context?.prevSingle) {
        queryClient.setQueryData(['experience', experience.id], context.prevSingle);
      }
      context?.listQueries.forEach(([queryKey, oldData]: any) => {
        queryClient.setQueryData(queryKey, oldData);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
      queryClient.invalidateQueries({ queryKey: ['experience', experience.id] });
      toast({
        title: toggleMutation.isError ? 'Error' : 'Success',
        description: toggleMutation.isError
          ? (toggleMutation.error as Error).message
          : experience.isDisabled
          ? 'Experience enabled'
          : 'Experience disabled',
        variant: toggleMutation.isError ? 'destructive' : 'default',
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="truncate">{experience.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-zinc-600 line-clamp-2">{experience.description}</p>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="truncate">{experience.location || 'No location'}</span>
          <span>{experience.experienceCost === 0 ? 'Free' : `$${experience.experienceCost}`}</span>
        </div>
        {experience.isAdmin && (
          <div className="mt-4 flex gap-2">
            <Button size="sm" variant="outline" onClick={() => toggleMutation.mutate()} disabled={toggleMutation.isPending}>
              {toggleMutation.isPending ? 'Updating...' : experience.isDisabled ? 'Enable' : 'Disable'}
            </Button>
            <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}