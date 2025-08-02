import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import { useUsersService } from '@/hooks/domain';
import { User } from '@/types/User';

interface UsersState {
  users: User[];
  filteredUsers: User[];
  selectedUsers: Set<string>;
  filters: UserFilters;
  pagination: PaginationState;
  loading: boolean;
  error: string | null;
  searchTerm: string;
  selectedUser: User | null;
}

interface UserFilters {
  role: string;
  department: string;
  status: string;
  location: string;
}

interface PaginationState {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

type UsersAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'SET_FILTERED_USERS'; payload: User[] }
  | { type: 'SET_FILTERS'; payload: Partial<UserFilters> }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'SET_PAGINATION'; payload: Partial<PaginationState> }
  | { type: 'SELECT_USER'; payload: string }
  | { type: 'DESELECT_USER'; payload: string }
  | { type: 'SELECT_ALL_USERS' }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_SELECTED_USER'; payload: User | null }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: { id: string; data: Partial<User> } }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'RESET_FILTERS' };

const initialUsersState: UsersState = {
  users: [],
  filteredUsers: [],
  selectedUsers: new Set(),
  filters: {
    role: '',
    department: '',
    status: '',
    location: ''
  },
  pagination: {
    page: 1,
    pageSize: 12,
    totalItems: 0,
    totalPages: 0
  },
  loading: false,
  error: null,
  searchTerm: '',
  selectedUser: null
};

const usersReducer = (state: UsersState, action: UsersAction): UsersState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_USERS':
      return { 
        ...state, 
        users: action.payload,
        loading: false,
        error: null
      };
    
    case 'SET_FILTERED_USERS':
      return { 
        ...state, 
        filteredUsers: action.payload,
        pagination: {
          ...state.pagination,
          totalItems: action.payload.length,
          totalPages: Math.ceil(action.payload.length / state.pagination.pageSize)
        }
      };
    
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
        pagination: { ...state.pagination, page: 1 }
      };
    
    case 'SET_SEARCH_TERM':
      return {
        ...state,
        searchTerm: action.payload,
        pagination: { ...state.pagination, page: 1 }
      };
    
    case 'SET_PAGINATION':
      return {
        ...state,
        pagination: { ...state.pagination, ...action.payload }
      };
    
    case 'SELECT_USER':
      return {
        ...state,
        selectedUsers: new Set([...state.selectedUsers, action.payload])
      };
    
    case 'DESELECT_USER':
      const newSelection = new Set(state.selectedUsers);
      newSelection.delete(action.payload);
      return {
        ...state,
        selectedUsers: newSelection
      };
    
    case 'SELECT_ALL_USERS':
      return {
        ...state,
        selectedUsers: new Set(state.filteredUsers.map(user => user.id))
      };
    
    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedUsers: new Set()
      };
    
    case 'SET_SELECTED_USER':
      return {
        ...state,
        selectedUser: action.payload
      };
    
    case 'ADD_USER':
      return {
        ...state,
        users: [...state.users, action.payload]
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id ? { ...user, ...action.payload.data } : user
        )
      };
    
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload),
        selectedUsers: new Set([...state.selectedUsers].filter(id => id !== action.payload))
      };
    
    case 'RESET_FILTERS':
      return {
        ...state,
        filters: initialUsersState.filters,
        searchTerm: '',
        pagination: { ...state.pagination, page: 1 }
      };
    
    default:
      return state;
  }
};

interface UsersContextType extends UsersState {
  // Actions
  setFilters: (filters: Partial<UserFilters>) => void;
  setSearchTerm: (term: string) => void;
  setPagination: (pagination: Partial<UsersState['pagination']>) => void;
  selectUser: (id: string) => void;
  deselectUser: (id: string) => void;
  selectAllUsers: () => void;
  clearSelection: () => void;
  setSelectedUser: (user: User | null) => void;
  resetFilters: () => void;
  
  // Operations
  createUser: (data: any) => Promise<void>;
  updateUser: (id: string, data: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  refetch: () => void;
  
  // Computed values
  paginatedUsers: User[];
  selectedCount: number;
  stats: {
    total: number;
    filtered: number;
    active: number;
    adminCount: number;
  };
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const useUsersContext = () => {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error('useUsersContext must be used within a UsersProvider');
  }
  return context;
};

interface UsersProviderProps {
  children: React.ReactNode;
}

export const UsersProvider: React.FC<UsersProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(usersReducer, initialUsersState);
  const { users, isLoading, error, refetch, createUser: createUsr } = useUsersService();

  // Sync external data with internal state
  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: isLoading });
  }, [isLoading]);

  useEffect(() => {
    if (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Error al cargar usuarios' });
    } else {
      dispatch({ type: 'SET_ERROR', payload: null });
    }
  }, [error]);

  useEffect(() => {
    if (users) {
      dispatch({ type: 'SET_USERS', payload: users });
    }
  }, [users]);

  // Apply filters
  const filteredUsers = useMemo(() => {
    return state.users.filter(user => {
      // Search term filter
      if (state.searchTerm) {
        const searchLower = state.searchTerm.toLowerCase();
        if (!user.email?.toLowerCase().includes(searchLower) &&
            !user.full_name?.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Other filters
      if (state.filters.role && user.role !== state.filters.role) return false;
      if (state.filters.department && user.department !== state.filters.department) return false;
      if (state.filters.status && user.status !== state.filters.status) return false;
      if (state.filters.location && user.location !== state.filters.location) return false;

      return true;
    });
  }, [state.users, state.searchTerm, state.filters]);

  useEffect(() => {
    dispatch({ type: 'SET_FILTERED_USERS', payload: filteredUsers });
  }, [filteredUsers]);

  // Actions
  const setFilters = useCallback((filters: Partial<UserFilters>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const setSearchTerm = useCallback((term: string) => {
    dispatch({ type: 'SET_SEARCH_TERM', payload: term });
  }, []);

  const setPagination = useCallback((pagination: Partial<UsersState['pagination']>) => {
    dispatch({ type: 'SET_PAGINATION', payload: pagination });
  }, []);

  const selectUser = useCallback((id: string) => {
    dispatch({ type: 'SELECT_USER', payload: id });
  }, []);

  const deselectUser = useCallback((id: string) => {
    dispatch({ type: 'DESELECT_USER', payload: id });
  }, []);

  const selectAllUsers = useCallback(() => {
    dispatch({ type: 'SELECT_ALL_USERS' });
  }, []);

  const clearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' });
  }, []);

  const setSelectedUser = useCallback((user: User | null) => {
    dispatch({ type: 'SET_SELECTED_USER', payload: user });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  // Operations
  const createUser = useCallback(async (data: any) => {
    try {
      await createUsr(data);
      refetch();
    } catch (error) {
      console.error('Error creating user:', error);
    }
  }, [createUsr, refetch]);

  const updateUser = useCallback(async (id: string, data: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: { id, data } });
    // TODO: Call actual update service
  }, []);

  const deleteUser = useCallback(async (id: string) => {
    dispatch({ type: 'DELETE_USER', payload: id });
    // TODO: Call actual delete service
  }, []);

  // Computed values
  const paginatedUsers = useMemo(() => {
    const startIndex = (state.pagination.page - 1) * state.pagination.pageSize;
    const endIndex = startIndex + state.pagination.pageSize;
    return state.filteredUsers.slice(startIndex, endIndex);
  }, [state.filteredUsers, state.pagination.page, state.pagination.pageSize]);

  const selectedCount = useMemo(() => state.selectedUsers.size, [state.selectedUsers]);

  const stats = useMemo(() => {
    const total = state.users.length;
    const active = state.users.filter(user => user.status === 'active').length;
    const adminCount = state.users.filter(user => user.role === 'admin' || user.role === 'superadmin').length;
    
    return {
      total,
      filtered: state.filteredUsers.length,
      active,
      adminCount
    };
  }, [state.users, state.filteredUsers.length]);

  const contextValue: UsersContextType = {
    ...state,
    setFilters,
    setSearchTerm,
    setPagination,
    selectUser,
    deselectUser,
    selectAllUsers,
    clearSelection,
    setSelectedUser,
    resetFilters,
    createUser,
    updateUser,
    deleteUser,
    refetch,
    paginatedUsers,
    selectedCount,
    stats
  };

  return (
    <UsersContext.Provider value={contextValue}>
      {children}
    </UsersContext.Provider>
  );
};
