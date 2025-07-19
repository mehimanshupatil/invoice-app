import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'Admin' | 'Accountant' | 'Viewer';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  tokens: {
    accessToken: string;
  };
  message: string;
}

// API functions
const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }
  
  return await response.json();
};

const logoutUser = async (): Promise<void> => {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Logout failed');
  }
};

const refreshToken = async (): Promise<AuthResponse> => {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Token refresh failed');
  }
  
  return await response.json();
};

const getCurrentUser = async (): Promise<User> => {
  const response = await fetch('/api/auth/me');
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get user data');
  }
  
  const data = await response.json();
  return data.user;
};

// React Query hooks
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      // Set user data in cache
      queryClient.setQueryData(['auth', 'user'], data.user);
      
      toast.success(data.message || 'Login successful!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Login failed');
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      
      toast.success('Logout successful!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Logout failed');
    },
  });
};

export const useRefreshToken = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: refreshToken,
    onSuccess: (data) => {
      // Update user data in cache
      queryClient.setQueryData(['auth', 'user'], data.user);
      
    },
    onError: (error: Error) => {
      // Clear cache and redirect to login on refresh failure
      queryClient.clear();
      
      // Don't show error toast for automatic refresh attempts
      console.error('Token refresh failed:', error.message);
    },
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['auth', 'user'],
    queryFn: getCurrentUser,
    retry: (failureCount, error: any) => {
      // Don't retry on 401 errors
      if (error?.message?.includes('401') || error?.message?.includes('unauthorized')) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
