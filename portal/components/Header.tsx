'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import LogoutButton from './LogoutButton';
import type { User } from '@/types/auth';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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
    <header className="sticky top-0 z-20 border-b border-zinc-200/50 bg-white/70 backdrop-blur-xl p-4 flex items-center justify-between shadow-sm shadow-zinc-200/50">
      <div className="flex items-center gap-4">
        {/* Hamburger button for mobile */}
        <button
          type="button"
          className="md:hidden p-2 rounded-md text-zinc-500 hover:bg-zinc-100/80 hover:text-zinc-900 transition-colors"
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
        <h1 className="text-xl font-bold text-zinc-900">Experience Portal</h1>
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 border-2 border-zinc-200 hover:border-zinc-300 text-sm font-semibold text-zinc-700 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500"
                aria-label="User menu"
              >
                {displayName.charAt(0).toUpperCase()}
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56 p-2 rounded-xl border border-zinc-200 bg-white shadow-xl shadow-zinc-200/50">
              <div className="px-2 py-1.5 text-sm">
                <p className="font-medium truncate text-zinc-900">{displayName}</p>
                {user.email && user.email !== displayName && (
                  <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                )}
              </div>
              <div className="my-1 h-px bg-zinc-100" />
              <div className="px-1 py-1">
                <LogoutButton className="w-full" />
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <LogoutButton />
        )}
      </div>
    </header>
  );
}
