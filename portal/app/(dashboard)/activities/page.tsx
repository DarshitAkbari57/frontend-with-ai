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

  const { data, isLoading, error } = useActivities({
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
  const activities = data?.data ?? [];

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = Number.parseInt(event.target.value, 10);
    setLimit(newLimit);
    setPage(1);
  };

  return (
    <div className="space-y-6">
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
              className="border rounded-lg p-6 space-y-4 animate-pulse bg-white dark:bg-zinc-800 dark:border-zinc-700"
            >
              <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4"></div>
              <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2"></div>
              <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/3"></div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              Page {page} of {totalPages}
            </div>
            <Button
              variant="outline"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
