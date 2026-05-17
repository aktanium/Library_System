import { createContext, useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { getToken, saveToken, removeToken } from '../utils/token';

export type UserRole = 'ADMIN' | 'USER';

export interface AuthContextValue {
  token: string | null;
  email: string | null;
  displayName: string | null;
  userRole: UserRole | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface JwtPayload {
  sub?: string;
  role?: string;
}

const decode = (token: string | null): JwtPayload | null => {
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1])) as JwtPayload;
  } catch {
    return null;
  }
};

const deriveName = (email: string | null): string | null => {
  if (!email) return null;
  const local = email.split('@')[0];
  if (!local) return null;
  return local
    .split(/[.\-_]+/)
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join(' ') || null;
};

const extractRole = (payload: JwtPayload | null): UserRole | null => {
  if (!payload) return null;
  if (payload.role === 'ADMIN') return 'ADMIN';
  if (payload.role === 'USER') return 'USER';
  return null;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => getToken());

  const value = useMemo<AuthContextValue>(() => {
    const payload = decode(token);
    const email = payload?.sub ?? null;
    const displayName = deriveName(email);
    const userRole = extractRole(payload);
    return {
      token,
      email,
      displayName,
      userRole,
      isAuthenticated: !!token,
      isAdmin: userRole === 'ADMIN',
      login: (newToken: string) => {
        saveToken(newToken);
        setToken(newToken);
      },
      logout: () => {
        removeToken();
        setToken(null);
      },
    };
  }, [token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
