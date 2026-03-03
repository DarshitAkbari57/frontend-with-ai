export interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number; // in seconds
  tokenType: string;
}

export interface User {
  id: number;
  email: string;
  userName: string;
  firstName: string;
  lastName: string | null;
  userRole: string;
  contactNumber: string;
  profilePicture?: {
    media: string;
    mediaType: string;
    mediaFor: string;
  };
  [key: string]: any;
}
