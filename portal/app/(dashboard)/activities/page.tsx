'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toast';
import { useActivities } from '@/hooks/useActivities';
import ActivityCard from '@/components/activity/ActivityCard';

export default function ActivitiesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const { data, isLoading, error, isFetching } = useActivities({
    page,
    limit,
  });

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
  const activities = data?.data ?? [];
  const hasExactTotal = data?.hasExactTotal ?? false;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = Number.parseInt(event.target.value, 10);
    setLimit(newLimit);
    setPage(1);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 space-y-6 pb-24">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Activities</h1>
          <div className="flex items-center gap-2">
            <Label htmlFor="limit" className="mr-2">
              Show
            </Label>
            <select
              id="limit"
              value={limit}
              onChange={handleLimitChange}
              className="border rounded-md px-2 py-1 text-sm bg-white dark:bg-zinc-900 dark:border-zinc-700"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: limit }).map((_, index) => (
              <div
                key={index}
                className="border rounded-lg p-6 space-y-4 animate-pulse bg-white dark:bg-zinc-800 dark:border-zinc-700 h-96"
              >
                <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4"></div>
                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2"></div>
                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/3"></div>
                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-2/3"></div>
                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              Total: {data?.total ?? 0} activities
            </div>

            {activities.length === 0 ? (
              <div className="rounded-md border border-dashed p-8 text-center text-sm text-zinc-500">
                No activities found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                {activities.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer with pagination */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Button
            variant="outline"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1 || isFetching}
          >
            Previous
          </Button>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
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
      </div>
    </div>
  );
}
