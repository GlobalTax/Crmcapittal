import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { BaseStore } from './types';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  created_at: string;
  updated_at: string;
  // Add other user fields as needed
}

interface UsersState {
  users: User[];
  selectedUsers: Set<string>;
  filters: Record<string, any>;
  searchTerm: string;
}

interface UsersActions {
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  removeUser: (id: string) => void;
  setFilters: (filters: Record<string, any>) => void;
  setSearchTerm: (term: string) => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
}

type UsersStore = BaseStore & UsersState & UsersActions;

export const useUsersStore = create<UsersStore>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Base store
        loading: false,
        error: null,
        
        // Users state
        users: [],
        selectedUsers: new Set(),
        filters: {},
        searchTerm: '',

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

        // Users actions
        setUsers: (users) => {
          set((state) => {
            state.users = users;
            state.selectedUsers.clear();
          });
        },

        addUser: (user) => {
          set((state) => {
            state.users.unshift(user);
          });
        },

        updateUser: (id, updates) => {
          set((state) => {
            const index = state.users.findIndex(user => user.id === id);
            if (index !== -1) {
              state.users[index] = { ...state.users[index], ...updates };
            }
          });
        },

        removeUser: (id) => {
          set((state) => {
            state.users = state.users.filter(user => user.id !== id);
            state.selectedUsers.delete(id);
          });
        },

        setFilters: (filters) => {
          set((state) => {
            state.filters = { ...state.filters, ...filters };
          });
        },

        setSearchTerm: (term) => {
          set((state) => {
            state.searchTerm = term;
          });
        },

        toggleSelection: (id) => {
          set((state) => {
            if (state.selectedUsers.has(id)) {
              state.selectedUsers.delete(id);
            } else {
              state.selectedUsers.add(id);
            }
          });
        },

        clearSelection: () => {
          set((state) => {
            state.selectedUsers.clear();
          });
        },
      }))
    ),
    {
      name: 'users-store',
    }
  )
);

// Selectors
export const useUsers = () => useUsersStore((state) => state.users);
export const useUsersLoading = () => useUsersStore((state) => state.loading);