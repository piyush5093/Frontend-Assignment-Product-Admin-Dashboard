'use client';

/**
 * AuthContext — provides authentication state and actions to the entire app.
 *
 * - Persists token and user to localStorage so auth survives a page refresh.
 * - Exposes: token, user, isAuthenticated, login(), logout()
 * - The shared axiosInstance reads the token directly from localStorage, so
 *   no manual token passing is needed in API calls.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { loginUser, LoginResponse } from '@/services/auth';

interface AuthUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
}

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  // isLoading is true until we've attempted to hydrate from localStorage
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate auth state from localStorage on mount (client-side only)
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const data: LoginResponse = await loginUser(username, password);
    const { accessToken, id, email, firstName, lastName, image } = data;
    const username_ = data.username;

    const authUser: AuthUser = { id, username: username_, email, firstName, lastName, image };

    localStorage.setItem('auth_token', accessToken);
    localStorage.setItem('auth_user', JSON.stringify(authUser));

    setToken(accessToken);
    setUser(authUser);
    router.push('/products');
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
    router.push('/login');
  }, [router]);

  const value: AuthContextValue = {
    token,
    user,
    isAuthenticated: !!token,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
