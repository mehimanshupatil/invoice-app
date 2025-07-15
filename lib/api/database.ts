import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

interface DatabaseStatus {
  connected: boolean;
  message: string;
}

// API functions
const checkDatabaseConnection = async (): Promise<DatabaseStatus> => {
  const response = await fetch('/api/database/init');
  if (!response.ok) {
    throw new Error('Failed to check database connection');
  }
  const data = await response.json();
  return {
    connected: data.connected,
    message: data.message,
  };
};

const initializeDatabase = async (): Promise<{ success: boolean; message: string }> => {
  const response = await fetch('/api/database/init', {
    method: 'POST',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to initialize database');
  }
  
  return await response.json();
};

// React Query hooks
export const useDatabaseStatus = () => {
  return useQuery({
    queryKey: ['database', 'status'],
    queryFn: checkDatabaseConnection,
    refetchInterval: 30000, // Check every 30 seconds
    retry: 2,
  });
};

export const useInitializeDatabase = () => {
  return useMutation({
    mutationFn: initializeDatabase,
    onSuccess: (data) => {
      toast.success(data.message || 'Database initialized successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to initialize database');
    },
  });
};