/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { login, getCurrentUser, isAuthenticated, logout } from '@/lib/auth';

jest.mock('amazon-cognito-identity-js', () => {
  const mockIdToken = { getJwtToken: jest.fn(() => 'mock-id-token') };
  const mockAccessToken = { getJwtToken: jest.fn(() => 'mock-access-token') };
  const mockRefreshToken = { getToken: jest.fn(() => 'mock-refresh-token') };
  const mockSignInUserSession = {
    getIdToken: jest.fn(() => mockIdToken),
    getAccessToken: jest.fn(() => mockAccessToken),
    getRefreshToken: jest.fn(() => mockRefreshToken),
  };

  const mockCognitoUser = jest.fn().mockImplementation(() => ({
    authenticateUser: jest.fn((authDetails: any, callback: any) => {
      if (authDetails.Password === 'wrong') {
        callback({ name: 'NotAuthorizedException' });
      } else {
        callback(null, { getSignInUserSession: jest.fn(() => mockSignInUserSession) });
      }
    }),
    getSignInUserSession: jest.fn(() => mockSignInUserSession),
    clearSession: jest.fn(),
  }));

  const mockCognitoUserPool = jest.fn().mockImplementation(() => ({
    getUser: jest.fn().mockReturnValue(mockCognitoUser()),
  }));

  return {
    CognitoUser: mockCognitoUser,
    CognitoUserPool: mockCognitoUserPool,
    AuthenticationDetails: jest.fn().mockImplementation((o) => o),
  };
});

global.fetch = jest.fn().mockResolvedValue({ ok: true });

describe('Authentication module', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:3000';
    process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID = 'dummy-pool';
    process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID = 'dummy-client';
    process.env.NEXT_PUBLIC_COGNITO_REGION = 'us-east-1';
    (global.fetch as jest.Mock).mockClear();
  });

  it('logs in successfully with valid credentials', async () => {
    const mobile = '+1234567890';
    const password = 'password123';

    const result = await login(mobile, password);

    expect(result).toEqual({
      user: { id: expect.any(String), mobileNumber: mobile },
      tokens: {
        accessToken: 'mock-access-token',
        idToken: 'mock-id-token',
        refreshToken: 'mock-refresh-token',
      },
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://localhost:3000/auth/login');
    expect(options?.method).toBe('POST');
    expect(options?.headers).toEqual({ 'Content-Type': 'application/json' });

    const body = JSON.parse((options?.body as string) || '{}');
    expect(body).toEqual({
      accessToken: 'mock-access-token',
      idToken: 'mock-id-token',
      refreshToken: 'mock-refresh-token',
    });
  });

  it('getCurrentUser returns null before login', () => {
    expect(getCurrentUser()).toBeNull();
  });

  it('getCurrentUser returns the logged-in user after login', async () => {
    const mobile = '+1234567890';
    await login(mobile, 'password');

    expect(getCurrentUser()).toEqual({ id: mobile, mobileNumber: mobile });
  });

  it('isAuthenticated returns false before login', () => {
    expect(isAuthenticated()).toBe(false);
  });

  it('isAuthenticated returns true after login', async () => {
    expect(isAuthenticated()).toBe(false);
    await login('+1234567890', 'password');
    expect(isAuthenticated()).toBe(true);
  });

  it('logout clears user and tokens and calls backend', async () => {
    const mobile = '+1234567890';
    await login(mobile, 'password');

    expect(getCurrentUser()).not.toBeNull();
    expect(isAuthenticated()).toBe(true);

    await logout();

    expect(getCurrentUser()).toBeNull();
    expect(isAuthenticated()).toBe(false);

    const logoutCalls = (global.fetch as jest.Mock).mock.calls.filter(
      (call: [string, any]) => call[0].includes('/auth/logout')
    );
    expect(logoutCalls.length).toBe(1);
    expect(logoutCalls[0][1]?.method).toBe('POST');
  });

  it('login rejects with invalid credentials and does not store user', async () => {
    await expect(login('+1234567890', 'wrong')).rejects.toMatchObject({
      name: 'NotAuthorizedException',
    });

    expect(getCurrentUser()).toBeNull();
    expect(isAuthenticated()).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
