'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toast';
import { useBookings } from '@/hooks/useBookings';

export default function BookingsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const { data, isLoading, error } = useBookings({
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

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = parseInt(e.target.value, 10);
    setLimit(newLimit);
    setPage(1); // reset to first page
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bookings</h1>
        <div className="flex items-center gap-2">
          <Label htmlFor="limit" className="mr-2">Show</Label>
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
          {/* Total count */}
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Total: {data?.total ?? 0} bookings
          </div>

          {/* List of bookings - for now just IDs, need proper BookingCard */}
          <div className="space-y-4">
            {data?.data?.map((booking) => (
              <div key={booking.id} className="border rounded-lg p-4 bg-white dark:bg-zinc-800 dark:border-zinc-700">
                <p>Booking ID: {booking.id}</p>
                {/* Add more fields as per API */}
              </div>
            ))}
          </div>

          {/* Pagination controls */}
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