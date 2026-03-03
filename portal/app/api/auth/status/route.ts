import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isTokenExpired, decodeToken } from '@/lib/auth/utils';
import type { User } from '@/types/auth';

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const idToken = cookieStore.get('idToken')?.value;

  if (!accessToken) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  // If access token is still valid (with 2-minute buffer), return it
  if (!isTokenExpired(accessToken, 120)) {
    const user = idToken ? decodeToken<User>(idToken) : decodeToken<User>(accessToken);
    return NextResponse.json({ authenticated: true, user });
  }

  // Access token expired. Since we don't have a new refresh mechanism yet,
  // we'll clear cookies and return unauthenticated.
  const response = NextResponse.json(
    { authenticated: false },
    { status: 401 }
  );
  response.cookies.delete('accessToken');
  response.cookies.delete('refreshToken');
  response.cookies.delete('idToken');
  return response;
}
