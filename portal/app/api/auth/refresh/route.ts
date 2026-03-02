import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { refreshTokens } from '@/lib/auth/cognito';
import { decodeToken } from '@/lib/auth/utils';
import type { User } from '@/types/auth';

export async function POST() {
  const cookieStore = cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { error: 'Refresh token not found' },
      { status: 401 }
    );
  }

  try {
    const tokens = await refreshTokens(refreshToken);
    const user = decodeToken<User>(tokens.idToken);

    const response = NextResponse.json(
      { success: true, user },
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
  } catch (error: any) {
    const response = NextResponse.json(
      { error: error.message || 'Refresh failed' },
      { status: 401 }
    );
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');
    response.cookies.delete('idToken');
    return response;
  }
}
