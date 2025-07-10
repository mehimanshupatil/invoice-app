'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthContextType, authenticateUser } from '@/lib/auth';
import { analytics } from '@/lib/analytics';
import { logger } from '@/lib/logger';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const authenticatedUser = await authenticateUser(email, password);
    if (authenticatedUser) {
      setUser(authenticatedUser);
      localStorage.setItem('user', JSON.stringify(authenticatedUser));
      
      // Track login event
      analytics.identify(authenticatedUser.id, {
        email: authenticatedUser.email,
        role: authenticatedUser.role,
      });
      analytics.track('user_login', {
        role: authenticatedUser.role,
      });
      
      logger.info('User logged in successfully', { 
        userId: authenticatedUser.id, 
        role: authenticatedUser.role 
      });
      
      return true;
    }
    
    logger.warn('Login attempt failed', { email });
    return false;
  };

  const logout = () => {
    const currentUser = user;
    setUser(null);
    localStorage.removeItem('user');
    
    if (currentUser) {
      analytics.track('user_logout', {
        role: currentUser.role,
      });
      logger.info('User logged out', { userId: currentUser.id });
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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