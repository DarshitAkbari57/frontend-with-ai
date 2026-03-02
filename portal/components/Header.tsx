'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import LogoutButton from './LogoutButton';
import type { User } from '@/types/auth';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/status');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error('Failed to fetch user', err);
        router.push('/login');
      }
    }
    fetchUser();
  }, [router]);

  // Determine display name
  const displayName = user?.email || user?.phone_number || user?.given_name || user?.sub || 'User';

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Hamburger button for mobile */}
        <button
          type="button"
          className="md:hidden p-2 rounded-md text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <h1 className="text-xl font-bold">Experience Portal</h1>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <div className="text-sm text-zinc-600 dark:text-zinc-300">
            {displayName}
          </div>
        )}
        <LogoutButton />
      </div>
    </header>
  );
}
