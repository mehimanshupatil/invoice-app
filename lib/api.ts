import { useGlobalLoader } from '@/hooks/useGlobalLoader';
import { toast } from 'sonner';

interface ApiOptions extends RequestInit {
  showLoader?: boolean;
  showErrorToast?: boolean;
}

export async function apiCall(
  url: string, 
  options: ApiOptions = {}
): Promise<Response> {
  const { 
    showLoader = true, 
    showErrorToast = true, 
    ...fetchOptions 
  } = options;

  const { startLoading, stopLoading } = useGlobalLoader.getState();

  try {
    if (showLoader) {
      startLoading();
    }

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
      ...fetchOptions,
    });

    if (!response.ok && showErrorToast) {
      const errorData = await response.json().catch(() => ({}));
      toast.error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    if (showErrorToast) {
      toast.error('Network error occurred');
    }
    throw error;
  } finally {
    if (showLoader) {
      stopLoading();
    }
  }
}

// Convenience methods
export const api = {
  get: (url: string, options?: ApiOptions) => 
    apiCall(url, { ...options, method: 'GET' }),
  
  post: (url: string, data?: any, options?: ApiOptions) =>
    apiCall(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  put: (url: string, data?: any, options?: ApiOptions) =>
    apiCall(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  delete: (url: string, options?: ApiOptions) =>
    apiCall(url, { ...options, method: 'DELETE' }),
};