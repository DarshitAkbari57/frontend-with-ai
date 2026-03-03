/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { login, getCurrentUser, isAuthenticated, logout } from '@/lib/auth';

global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ success: true, user: { id: 1, email: 'test@example.com' } }),
});

describe('Authentication module', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:3000';
    (global.fetch as jest.Mock).mockClear();
  });

  it('logs in successfully with valid credentials', async () => {
    const email = 'test@example.com';
    const password = 'password123';

    await login(email, password);

    expect(getCurrentUser()).toEqual({ id: 1, email });
    expect(isAuthenticated()).toBe(true);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/auth/login');
    expect(options?.method).toBe('POST');
  });

  it('getCurrentUser returns null before login', () => {
    expect(getCurrentUser()).toBeNull();
  });

  it('getCurrentUser returns the logged-in user after login', async () => {
    const email = 'test@example.com';
    await login(email, 'password');

    expect(getCurrentUser()).toEqual({ id: 1, email });
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
