import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isTokenExpired, decodeToken } from '@/lib/auth/utils';
import { refreshTokens } from '@/lib/auth/cognito';
import type { User } from '@/types/auth';

export async function GET() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;
  const idToken = cookieStore.get('idToken')?.value;

  if (!accessToken) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  // If access token is still valid (with 2-minute buffer), return it
  if (!isTokenExpired(accessToken, 120)) {
    const user = idToken ? decodeToken<User>(idToken) : decodeToken<User>(accessToken);
    return NextResponse.json({ authenticated: true, user });
  }

  // Access token expired, try to refresh
  if (!refreshToken) {
    const response = NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');
    response.cookies.delete('idToken');
    return response;
  }

  try {
    const tokens = await refreshTokens(refreshToken);
    const user = decodeToken<User>(tokens.idToken);

    const response = NextResponse.json(
      { authenticated: true, user },
      { status: 200 }
    );

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };

    response.cookies.set('accessToken', tokens.accessToken, {
      ...cookieOptions,
      maxAge: tokens.expiresIn,
    });
    response.cookies.set('refreshToken', tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 30,
    });
    response.cookies.set('idToken', tokens.idToken, {
      ...cookieOptions,
      maxAge: tokens.expiresIn,
    });

    return response;
  } catch (error) {
    const response = NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');
    response.cookies.delete('idToken');
    return response;
  }
}
