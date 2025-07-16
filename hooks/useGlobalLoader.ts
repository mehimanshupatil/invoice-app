'use client';

import { create } from 'zustand';

interface GlobalLoaderStore {
  isLoading: boolean;
  loadingCount: number;
  setLoading: (loading: boolean) => void;
  startLoading: () => void;
  stopLoading: () => void;
}

export const useGlobalLoader = create<GlobalLoaderStore>((set) => ({
  isLoading: false,
  loadingCount: 0,
  setLoading: (loading: boolean) =>
    set({ isLoading: loading, loadingCount: loading ? 1 : 0 }),
  startLoading: () =>
    set((state) => ({
      loadingCount: state.loadingCount + 1,
      isLoading: true,
    })),
  stopLoading: () =>
    set((state) => ({
      loadingCount: Math.max(0, state.loadingCount - 1),
      isLoading: state.loadingCount > 1,
    })),
}));