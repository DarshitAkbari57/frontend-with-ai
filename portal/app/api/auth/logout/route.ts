import { NextResponse } from 'next/server';

export async function POST() {
  // Clear all auth cookies
  const response = NextResponse.json({ success: true }, { status: 200 });
  response.cookies.delete('accessToken');
  response.cookies.delete('refreshToken');
  response.cookies.delete('idToken');
  return response;
}
