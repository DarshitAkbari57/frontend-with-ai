import type { User } from '@/types/auth';

let _currentUser: User | null = null;
let _authenticated = false;

export async function login(email: string, password: string, countryCode: string = '+91'): Promise<void> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, countryCode, userRole: 'user' }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Login failed');
  }

  const data = await response.json();
  _currentUser = data.user;
  _authenticated = true;
}

export function getCurrentUser(): User | null {
  return _currentUser;
}

export function isAuthenticated(): boolean {
  return _authenticated;
}

export async function logout(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
    });
  } catch {
    // Ignore errors during logout
  }

  _currentUser = null;
  _authenticated = false;
}
