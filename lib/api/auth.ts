import { apiClient, AUTH_STORAGE_KEY, TOKEN_STORAGE_KEY } from './client';
import { LoginResponse, User } from './types';

export interface LoginCredentials {
  username: string;
  password: string;
  expiresInMins?: number;
}

/**
 * Logs in with username and password against DummyJSON POST /auth/login.
 * Returns the user data along with accessToken and refreshToken.
 */
export async function loginUser(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/auth/login', {
    username: credentials.username,
    password: credentials.password,
    expiresInMins: credentials.expiresInMins || 60,
  });
  return response.data;
}

/**
 * Helper to store auth token and user profile in localStorage.
 */
export function setStoredAuth(data: LoginResponse): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_STORAGE_KEY, data.accessToken);
  const user: User = {
    id: data.id,
    username: data.username,
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    gender: data.gender,
    image: data.image,
  };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

/**
 * Helper to retrieve stored user and token on initial render.
 */
export function getStoredAuth(): { token: string | null; user: User | null } {
  if (typeof window === 'undefined') {
    return { token: null, user: null };
  }
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const userJson = localStorage.getItem(AUTH_STORAGE_KEY);
  let user: User | null = null;
  if (userJson) {
    try {
      user = JSON.parse(userJson);
    } catch {
      user = null;
    }
  }
  return { token, user };
}

/**
 * Clear stored auth credentials from localStorage.
 */
export function clearStoredAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(AUTH_STORAGE_KEY);
}
