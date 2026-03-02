import { cookies } from 'next/headers';

export interface BackendResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export async function fetchFromBackend<T>(path: string, options: RequestInit = {}): Promise<T> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    throw new Error('Missing NEXT_PUBLIC_API_BASE_URL environment variable');
  }

  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${baseUrl}/api/v1${normalizedPath}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `Backend responded with status ${response.status}`;
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.message || errorMessage;
    } catch {
      // ignore parsing errors
    }
    const err = new Error(errorMessage);
    // Attach status for proper HTTP response forwarding
    Object.defineProperty(err, 'status', { value: response.status, enumerable: true });
    throw err;
  }

  const json = (await response.json()) as BackendResponse<T>;
  return json.data;
}

// Helper that returns full backend response (including metadata like total)
export async function fetchBackendRaw<T>(path: string, options: RequestInit = {}): Promise<{ data: T } & Record<string, any>> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    throw new Error('Missing NEXT_PUBLIC_API_BASE_URL environment variable');
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${baseUrl}/api/v1${normalizedPath}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `Backend responded with status ${response.status}`;
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.message || errorMessage;
    } catch {
      // ignore parsing errors
    }
    const err = new Error(errorMessage);
    Object.defineProperty(err, 'status', { value: response.status, enumerable: true });
    throw err;
  }

  const json = await response.json();
  return json as { data: T } & Record<string, any>;
}
