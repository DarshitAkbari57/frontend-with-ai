import { NextResponse } from 'next/server';
import type { User } from '@/types/auth';

export async function POST(request: Request) {
  try {
    const { email, password, countryCode, userRole } = await request.json();

    if (!email || !password || !countryCode || !userRole) {
      return NextResponse.json(
        { error: 'Email, password, country code, and user role are required' },
        { status: 400 }
      );
    }

    const res = await fetch('http://api.invixp.com/api/v1/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, countryCode, userRole }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || 'Authentication failed' },
        { status: res.status }
      );
    }

    const { token, accessToken } = data.data;

    const response = NextResponse.json(
      { success: true, user: data.data },
      { status: 200 }
    );

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };

    // Use 'accessToken' for the main JWT (it seems 'token' is also a Bearer token)
    // The response has both 'token' (with Bearer prefix) and 'accessToken' (raw JWT)
    response.cookies.set('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 24, // Setting to 1 day as expires information isn't directly in top level
    });

    // Some systems expect idToken, let's store 'token' (raw JWT without Bearer if possible, but let's see)
    // Actually the 'token' in data.data has 'Bearer ' prefix, we should probably strip it if we want the raw JWT
    const rawToken = token.startsWith('Bearer ') ? token.substring(7) : token;
    response.cookies.set('idToken', rawToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}
