/**
 * Auth service — all authentication-related API calls.
 * Uses the shared axiosInstance (with interceptors).
 */

import axiosInstance from './axiosInstance';

export interface LoginResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  accessToken: string;
  refreshToken: string;
}

/**
 * POST /auth/login
 * Logs in with username + password and returns the auth payload (including accessToken).
 */
export async function loginUser(
  username: string,
  password: string
): Promise<LoginResponse> {
  const response = await axiosInstance.post<LoginResponse>('/auth/login', {
    username,
    password,
    expiresInMins: 60,
  });
  return response.data;
}
