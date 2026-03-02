import { NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth/cognito';
import { decodeToken } from '@/lib/auth/utils';
import type { User } from '@/types/auth';

export async function POST(request: Request) {
  try {
    const { mobileNumber, password } = await request.json();

    if (!mobileNumber || !password) {
      return NextResponse.json(
        { error: 'Mobile number and password are required' },
        { status: 400 }
      );
    }

    const tokens = await authenticateUser(mobileNumber, password);
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
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    response.cookies.set('idToken', tokens.idToken, {
      ...cookieOptions,
      maxAge: tokens.expiresIn,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Authentication failed' },
      { status: 401 }
    );
  }
}
