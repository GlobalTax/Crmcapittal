import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { GlobalSearchStore } from './types';

export const useGlobalSearchStore = create<GlobalSearchStore>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          // Base store
          loading: false,
          error: null,
          
          // Global search state
          isOpen: false,
          query: '',
          results: [],
          recentSearches: [],

          // Base actions
          setLoading: (loading) => {
            set((state) => {
              state.loading = loading;
            });
          },

          setError: (error) => {
            set((state) => {
              state.error = error;
            });
          },

          // Global search actions
          setOpen: (isOpen) => {
            set((state) => {
              state.isOpen = isOpen;
              if (!isOpen) {
                state.query = '';
                state.results = [];
              }
            });
          },

          setQuery: (query) => {
            set((state) => {
              state.query = query;
            });
          },

          setResults: (results) => {
            set((state) => {
              state.results = results;
            });
          },

          addRecentSearch: (query) => {
            if (!query.trim()) return;
            
            set((state) => {
              // Remove if already exists
              state.recentSearches = state.recentSearches.filter(q => q !== query);
              // Add to beginning
              state.recentSearches.unshift(query);
              // Keep only last 10
              if (state.recentSearches.length > 10) {
                state.recentSearches = state.recentSearches.slice(0, 10);
              }
            });
          },

          clearRecentSearches: () => {
            set((state) => {
              state.recentSearches = [];
            });
          },
        }))
      ),
      {
        name: 'global-search-store',
        partialize: (state) => ({
          recentSearches: state.recentSearches,
        }),
      }
    ),
    {
      name: 'global-search-store',
    }
  )
);

// Selectors
export const useGlobalSearchOpen = () => useGlobalSearchStore((state) => state.isOpen);
export const useGlobalSearchQuery = () => useGlobalSearchStore((state) => state.query);
export const useGlobalSearchResults = () => useGlobalSearchStore((state) => state.results);
export const useRecentSearches = () => useGlobalSearchStore((state) => state.recentSearches);
