import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

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
  const response = await fetch('/api/users');
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  const data = await response.json();
  return data.data;
};

const fetchUser = async (id: string): Promise<DatabaseUser> => {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  const data = await response.json();
  return data.data;
};

const createUser = async (userData: CreateUserData): Promise<DatabaseUser> => {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create user');
  }
  
  const data = await response.json();
  return data.data;
};

const updateUser = async ({ id, ...userData }: UpdateUserData & { id: string }): Promise<DatabaseUser> => {
  const response = await fetch(`/api/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update user');
  }
  
  const data = await response.json();
  return data.data;
};

const deleteUser = async (id: string): Promise<void> => {
  const response = await fetch(`/api/users/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete user');
  }
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