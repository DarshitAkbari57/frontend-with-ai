import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';

let _currentUser: User | null = null;
let _tokens: Tokens | null = null;

export interface User {
  id: string;
  mobileNumber: string;
}

export interface Tokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: Tokens;
}

export async function login(mobileNumber: string, password: string): Promise<AuthResponse> {
  const { NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_COGNITO_USER_POOL_ID, NEXT_PUBLIC_COGNITO_CLIENT_ID } = process.env;

  if (!NEXT_PUBLIC_API_BASE_URL || !NEXT_PUBLIC_COGNITO_USER_POOL_ID || !NEXT_PUBLIC_COGNITO_CLIENT_ID) {
    throw new Error('Missing required environment variables for authentication');
  }

  const pool = new CognitoUserPool({
    UserPoolId: NEXT_PUBLIC_COGNITO_USER_POOL_ID,
    ClientId: NEXT_PUBLIC_COGNITO_CLIENT_ID,
  });

  const user = new CognitoUser({
    Username: mobileNumber,
    UserPool: pool,
  });

  const authDetails = new AuthenticationDetails({
    Username: mobileNumber,
    Password: password,
  });

  const session = await new Promise<any>((resolve, reject) => {
    user.authenticateUser(authDetails, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });

  const signInUserSession = session.getSignInUserSession();
  const accessToken = signInUserSession.getAccessToken().getJwtToken();
  const idToken = signInUserSession.getIdToken().getJwtToken();
  const refreshToken = signInUserSession.getRefreshToken().getToken();

  const userObj: User = {
    id: mobileNumber,
    mobileNumber,
  };

  const response: AuthResponse = {
    user: userObj,
    tokens: {
      accessToken,
      idToken,
      refreshToken,
    },
  };

  const fetchResponse = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      accessToken,
      idToken,
      refreshToken,
    }),
  });

  if (!fetchResponse.ok) {
    throw new Error('Failed to establish session with backend');
  }

  _currentUser = userObj;
  _tokens = response.tokens;

  return response;
}

export function getCurrentUser(): User | null {
  return _currentUser;
}

export function isAuthenticated(): boolean {
  return _tokens !== null;
}

export async function logout(): Promise<void> {
  const { NEXT_PUBLIC_API_BASE_URL } = process.env;

  if (NEXT_PUBLIC_API_BASE_URL) {
    try {
      await fetch(`${NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
        method: 'POST',
      });
    } catch {
      // Ignore errors during logout
    }
  }

  _currentUser = null;
  _tokens = null;
}
