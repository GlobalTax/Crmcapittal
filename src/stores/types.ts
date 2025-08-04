import { User, Session } from '@supabase/supabase-js';
import { Operation } from '@/types/Operation';
import { Lead } from '@/types/Lead';

// Base store interface
export interface BaseStore {
  loading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Auth store state
export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  signInWithProvider: (provider: 'microsoft' | 'google') => Promise<{ error: any }>;
  refreshSession: () => Promise<{ error: any }>;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
}

export type AuthStore = AuthState & AuthActions;

// Operations store
export interface OperationsState {
  operations: Operation[];
  selectedOperations: Set<string>;
  filters: Record<string, any>;
  searchTerm: string;
  pagination: {
    page: number;
    pageSize: number;
  };
}

export interface OperationsActions {
  setOperations: (operations: Operation[]) => void;
  addOperation: (operation: Operation) => void;
  updateOperation: (id: string, updates: Partial<Operation>) => void;
  removeOperation: (id: string) => void;
  setFilters: (filters: Record<string, any>) => void;
  setSearchTerm: (term: string) => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  selectAll: () => void;
  setPagination: (pagination: Partial<OperationsState['pagination']>) => void;
}

export type OperationsStore = BaseStore & OperationsState & OperationsActions;

// Global search store
export interface GlobalSearchState {
  isOpen: boolean;
  query: string;
  results: any[];
  recentSearches: string[];
}

export interface GlobalSearchActions {
  setOpen: (isOpen: boolean) => void;
  setQuery: (query: string) => void;
  setResults: (results: any[]) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
}

export type GlobalSearchStore = BaseStore & GlobalSearchState & GlobalSearchActions;