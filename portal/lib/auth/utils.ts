export function decodeToken<T = any>(token: string): T {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }
  const payload = parts[1];

  // Convert base64url to base64
  let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  // Pad with '='
  const pad = base64.length % 4;
  if (pad) {
    if (pad === 1) {
      base64 += '===';
    } else {
      base64 += '='.repeat(4 - pad);
    }
  }

  // Decode base64
  const decodedBinary = atob(base64);
  // Convert binary string to UTF-8
  const charArray = new Uint8Array(decodedBinary.length);
  for (let i = 0; i < decodedBinary.length; i++) {
    charArray[i] = decodedBinary.charCodeAt(i);
  }
  const decoder = new TextDecoder('utf-8');
  const decoded = decoder.decode(charArray);
  return JSON.parse(decoded) as T;
}

export function isTokenExpired(token: string, bufferSeconds: number = 0): boolean {
  try {
    const payload: any = decodeToken(token);
    if (!payload.exp) {
      return true;
    }
    const now = Math.floor(Date.now() / 1000);
    return payload.exp <= now + bufferSeconds;
  } catch {
    return true;
  }
}
