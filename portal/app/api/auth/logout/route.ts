import { NextResponse } from 'next/server';

export async function POST() {
  // Clear all auth cookies
  const response = NextResponse.json({ success: true }, { status: 200 });
  response.cookies.delete('accessToken', { path: '/' });
  response.cookies.delete('refreshToken', { path: '/' });
  response.cookies.delete('idToken', { path: '/' });
  return response;
}
