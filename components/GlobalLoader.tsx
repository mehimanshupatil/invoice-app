'use client';

import { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';

interface GlobalLoaderProps {
  isLoading: boolean;
}

export function GlobalLoader({ isLoading }: GlobalLoaderProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isLoading) {
      // Small delay to prevent flash for quick requests
      const timer = setTimeout(() => setShow(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isLoading]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card p-6 rounded-lg shadow-lg border flex items-center space-x-3">
        <Spinner size="md" className="text-primary" />
        <span className="text-sm font-medium">Loading...</span>
      </div>
    </div>
  );
}