'use client';

import { createContext, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser, useLogin, useLogout } from '@/lib/api/auth';
import type { User } from '@/lib/api/auth';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: user, isLoading, error } = useCurrentUser();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await loginMutation.mutateAsync({ email, password });
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    logoutMutation.mutate();
    router.push('/login');
  };

  // Redirect to login if authentication fails
  useEffect(() => {
    if (error && !isLoading) {
      router.push('/login');
    }
  }, [error, isLoading, router]);

  const value: AuthContextType = {
    user: user || null,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading: isLoading || loginMutation.isPending || logoutMutation.isPending,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}