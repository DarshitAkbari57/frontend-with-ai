'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/status');
        if (res.ok) {
          setIsAuth(true);
        } else {
          setIsAuth(false);
          router.push('/login');
        }
      } catch (err) {
        setIsAuth(false);
        router.push('/login');
      }
    }
    checkAuth();
  }, [router]);

  if (isAuth === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-zinc-900"></div>
      </div>
    );
  }

  return <>{children}</>;
}
