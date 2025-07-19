import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from './apiClient';

export interface DatabaseUser {
  id: string;
  email: string;
  name: string;
  role: 'Admin' | 'Accountant' | 'Viewer';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role: 'Admin' | 'Accountant' | 'Viewer';
  is_active?: boolean;
}

export interface UpdateUserData {
  email?: string;
  name?: string;
  password?: string;
  role?: 'Admin' | 'Accountant' | 'Viewer';
  is_active?: boolean;
}

// API functions
const fetchUsers = async (): Promise<DatabaseUser[]> => {
  const data = await apiClient.get<{ data: DatabaseUser[] }>('/api/users');
  return data.data;
};

const fetchUser = async (id: string): Promise<DatabaseUser> => {
  const data = await apiClient.get<{ data: DatabaseUser }>(`/api/users/${id}`);
  return data.data;
};

const createUser = async (userData: CreateUserData): Promise<DatabaseUser> => {
  const data = await apiClient.post<{ data: DatabaseUser }>('/api/users', userData);
  return data.data;
};

const updateUser = async ({ id, ...userData }: UpdateUserData & { id: string }): Promise<DatabaseUser> => {
  const data = await apiClient.put<{ data: DatabaseUser }>(`/api/users/${id}`, userData);
  return data.data;
};

const deleteUser = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/users/${id}`);
};

// React Query hooks
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => fetchUser(id),
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createUser,
    onSuccess: (newUser) => {
      // Update the users list cache
      queryClient.setQueryData(['users'], (oldUsers: DatabaseUser[] = []) => [
        ...oldUsers,
        newUser,
      ]);
      
      // Invalidate and refetch users
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      toast.success('User created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create user');
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateUser,
    onSuccess: (updatedUser) => {
      // Update the users list cache
      queryClient.setQueryData(['users'], (oldUsers: DatabaseUser[] = []) =>
        oldUsers.map(user => user.id === updatedUser.id ? updatedUser : user)
      );
      
      // Update individual user cache
      queryClient.setQueryData(['users', updatedUser.id], updatedUser);
      
      toast.success('User updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user');
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: (_, deletedUserId) => {
      // Remove user from cache
      queryClient.setQueryData(['users'], (oldUsers: DatabaseUser[] = []) =>
        oldUsers.filter(user => user.id !== deletedUserId)
      );
      
      // Remove individual user cache
      queryClient.removeQueries({ queryKey: ['users', deletedUserId] });
      
      toast.success('User deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete user');
    },
  });
};