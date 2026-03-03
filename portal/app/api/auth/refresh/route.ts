import { NextResponse } from 'next/server';

export async function POST() {
  // New API doesn't seem to provide a refresh token.
  // Clearing cookies and returning 401.
  const response = NextResponse.json(
    { error: 'Refresh not supported' },
    { status: 401 }
  );
  response.cookies.delete('accessToken');
  response.cookies.delete('refreshToken');
  response.cookies.delete('idToken');
  return response;
}
