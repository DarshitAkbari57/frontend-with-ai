export interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number; // in seconds
  tokenType: string;
}

export interface User {
  sub: string;
  email?: string;
  phone_number?: string;
  given_name?: string;
  family_name?: string;
  [key: string]: any;
}
