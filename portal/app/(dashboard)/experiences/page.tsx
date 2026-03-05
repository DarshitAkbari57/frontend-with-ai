'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toast';
import { useExperiences } from '@/hooks/useExperiences';
import ExperienceCard from '@/components/experience/ExperienceCard';

export default function ExperiencesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const { data, isLoading, error, isFetching } = useExperiences({
    page,
    limit,
  });

  // Show toast on error
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [error]);

  const totalPages = data?.totalPages ?? 1;
  const canGoNext = data?.hasMore ?? page < totalPages;
  const hasExactTotal = data?.hasExactTotal ?? false;
  const experiences = data?.data ?? [];

  const handlePageChange = (newPage: number) => {
    const safePage = Math.max(1, newPage);
    setPage((prevPage) => (prevPage === safePage ? prevPage : safePage));
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = parseInt(e.target.value, 10);
    setLimit(newLimit);
    setPage(1); // reset to first page
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200/80 bg-gradient-to-br from-white via-zinc-50 to-zinc-100/80 p-6 shadow-sm dark:border-zinc-800 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Experiences</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              Explore all experiences from backend data. Click any card to open full details.
            </p>
          </div>
          {hasExactTotal ? (
            <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900">
              <span className="font-semibold">{data?.total ?? 0}</span> total experiences
            </div>
          ) : (
            <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
              Total count unavailable
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-zinc-200/80 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-base font-semibold">Experience List</h2>
        <div className="flex items-center gap-2">
          <Label htmlFor="limit" className="mr-2">
            Show
          </Label>
          <select
            id="limit"
            value={limit}
            onChange={handleLimitChange}
            className="rounded-md border bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">per page</span>
        </div>
      </div>

      {isLoading ? (
        // Skeleton
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="border rounded-lg p-6 space-y-4 animate-pulse bg-white dark:bg-zinc-800 dark:border-zinc-700">
              <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4"></div>
              <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2"></div>
              <div className="flex justify-between">
                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/4"></div>
                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {experiences.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              No experiences found for the selected page size.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {experiences.map((experience) => (
                <ExperienceCard key={experience.id} experience={experience} />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between rounded-xl border border-zinc-200/80 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <Button
              variant="outline"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1 || isFetching}
            >
              Previous
            </Button>
            <div className="text-sm text-zinc-600 dark:text-zinc-300">
              {hasExactTotal ? `Page ${page} of ${totalPages}` : `Page ${page}`}
            </div>
            <Button
              variant="outline"
              onClick={() => handlePageChange(page + 1)}
              disabled={!canGoNext || isFetching}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
