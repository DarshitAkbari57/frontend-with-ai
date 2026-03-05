'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import type { Experience, PaginatedResponse } from '@/types/api';
import { deleteExperience, updateExperience } from '@/services/experienceService';
import { CalendarDays, MapPin, UserRound, ArrowRight, Shield } from 'lucide-react';

interface ExperienceCardProps {
  experience: Experience;
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

export default function ExperienceCard({ experience }: ExperienceCardProps) {
  const router = useRouter();
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

  const handleOpenDetails = () => {
    router.push(`/experiences/${experience.id}`);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleOpenDetails();
    }
  };

  const costLabel = experience.experienceCost > 0 ? `$${experience.experienceCost}` : 'Free';

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={handleOpenDetails}
      onKeyDown={handleKeyDown}
      className="group cursor-pointer overflow-hidden border-zinc-200/80 !py-0 !gap-0 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-zinc-800"
    >
      <div className="relative h-44 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {experience.expPicture?.media ? (
          <Image
            src={experience.expPicture.media}
            alt={experience.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-100 via-zinc-200 to-zinc-300 text-sm font-medium text-zinc-500 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-700 dark:text-zinc-300">
            No image available
          </div>
        )}
        <div className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          {costLabel}
        </div>
        {experience.isOnline && (
          <div className="absolute right-3 top-3 rounded-full bg-emerald-500/90 px-2.5 py-1 text-xs font-semibold text-white">
            Online
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="line-clamp-1 text-lg">{experience.title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="line-clamp-2 min-h-10 text-sm text-zinc-600 dark:text-zinc-300">
          {experience.description || 'No description available.'}
        </p>

        <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
            <span className="line-clamp-1">{experience.location || experience.address || 'Location not provided'}</span>
          </div>
          <div className="flex items-start gap-2">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
            <span className="line-clamp-1">{formatDate(experience.experienceStartDateTime)}</span>
          </div>
          <div className="flex items-start gap-2">
            <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
            <span className="line-clamp-1">{experience.userDetail?.userName || `Owner #${experience.experienceOwnerId}`}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 text-sm font-medium text-zinc-700 dark:text-zinc-200">
          <span>View details</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </div>

        {experience.isAdmin && (
          <div
            className="mt-4 flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <div className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              <Shield className="h-3 w-3" />
              Admin controls
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => toggleMutation.mutate()}
              disabled={toggleMutation.isPending}
            >
              {toggleMutation.isPending ? 'Updating...' : experience.isDisabled ? 'Enable' : 'Disable'}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
