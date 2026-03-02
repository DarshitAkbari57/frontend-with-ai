import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoRefreshToken,
} from 'amazon-cognito-identity-js';
import { AuthTokens } from '@/types/auth';

const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
  ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
};

const userPool = new CognitoUserPool(poolData);

export function authenticateUser(
  username: string,
  password: string
): Promise<AuthTokens> {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({
      Username: username,
      Pool: userPool,
    });

    const authDetails = new AuthenticationDetails({
      Username: username,
      Password: password,
    });

    user.authenticateUser(authDetails, {
      onSuccess: (session) => {
        const accessToken = session.getAccessToken().getJwtToken();
        const idToken = session.getIdToken().getJwtToken();
        const refreshToken = session.getRefreshToken().getToken();
        const expiresIn = Math.floor(
          (session.getAccessToken().getExpiration().getTime() - Date.now()) /
            1000
        );

        resolve({
          accessToken,
          idToken,
          refreshToken,
          expiresIn,
          tokenType: 'Bearer',
        });
      },
      onFailure: (err) => {
        reject(err);
      },
      newPasswordRequired: (user, firstMeta) => {
        reject(new Error('New password required'));
      },
    });
  });
}

export function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Pool: userPool });
    user.refreshSession(
      new CognitoRefreshToken({ RefreshToken: refreshToken }),
      {
        onSuccess: (session) => {
          const accessToken = session.getAccessToken().getJwtToken();
          const idToken = session.getIdToken().getJwtToken();
          const refreshToken = session.getRefreshToken().getToken();
          const expiresIn = Math.floor(
            (session.getAccessToken().getExpiration().getTime() - Date.now()) /
              1000
          );

          resolve({
            accessToken,
            idToken,
            refreshToken,
            expiresIn,
            tokenType: 'Bearer',
          });
        },
        onFailure: (err) => {
          reject(err);
        },
      }
    );
  });
}
