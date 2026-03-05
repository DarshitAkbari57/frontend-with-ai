import { NextResponse } from 'next/server';

function normalizeToken(token?: string): string | null {
  if (!token) return null;
  const trimmed = token.trim();
  if (!trimmed) return null;
  return trimmed.startsWith('Bearer ') ? trimmed.slice(7) : trimmed;
}

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

    const { token, accessToken } = data.data ?? {};

    const normalizedAccessToken = normalizeToken(accessToken);
    const normalizedToken = normalizeToken(token);
    const primaryToken = normalizedAccessToken || normalizedToken;

    if (!primaryToken) {
      return NextResponse.json(
        { error: 'Authentication failed: token missing in login response' },
        { status: 502 }
      );
    }

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

    response.cookies.set('accessToken', primaryToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 24, // Setting to 1 day as expires information isn't directly in top level
    });

    response.cookies.set('idToken', normalizedToken || primaryToken, {
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
