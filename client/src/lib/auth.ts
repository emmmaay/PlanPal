import { createContext, useContext } from 'react';

export interface User {
  id: string;
  email: string;
  username: string;
  isCreator: boolean;
}

export interface Role {
  id: string;
  userId: string;
  roleType: string;
  scope?: string;
  assignedBy?: string;
  createdAt: string;
}

export interface CourseMembership {
  id: string;
  userId: string;
  courseId: string;
  role: string;
  status: string;
  joinedAt: string;
}

export interface AuthContextType {
  user: User | null;
  roles: Role[];
  memberships: CourseMembership[];
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (roleType: string) => boolean;
  isCourseAdmin: (courseId: string) => boolean;
  isTopAdmin: boolean;
  isCreator: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Token storage
export const tokenStorage = {
  get: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  },
  
  set: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth_token', token);
  },
  
  remove: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_token');
  }
};

// API helper with authentication
export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const token = tokenStorage.get();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // If token is invalid, remove it
  if (response.status === 401) {
    tokenStorage.remove();
    window.location.href = '/login';
  }

  return response;
}