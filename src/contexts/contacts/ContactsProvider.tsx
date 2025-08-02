import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import { useContactsService } from '@/hooks/domain';
import { Contact } from '@/types/Contact';

interface ContactsState {
  contacts: Contact[];
  filteredContacts: Contact[];
  selectedContacts: Set<string>;
  filters: ContactFilters;
  pagination: PaginationState;
  loading: boolean;
  error: string | null;
  searchTerm: string;
  selectedContact: Contact | null;
}

interface ContactFilters {
  companyId: string;
  role: string;
  location: string;
  status: string;
}

interface PaginationState {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

type ContactsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CONTACTS'; payload: Contact[] }
  | { type: 'SET_FILTERED_CONTACTS'; payload: Contact[] }
  | { type: 'SET_FILTERS'; payload: Partial<ContactFilters> }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'SET_PAGINATION'; payload: Partial<PaginationState> }
  | { type: 'SELECT_CONTACT'; payload: string }
  | { type: 'DESELECT_CONTACT'; payload: string }
  | { type: 'SELECT_ALL_CONTACTS' }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_SELECTED_CONTACT'; payload: Contact | null }
  | { type: 'ADD_CONTACT'; payload: Contact }
  | { type: 'UPDATE_CONTACT'; payload: { id: string; data: Partial<Contact> } }
  | { type: 'DELETE_CONTACT'; payload: string }
  | { type: 'RESET_FILTERS' };

const initialContactsState: ContactsState = {
  contacts: [],
  filteredContacts: [],
  selectedContacts: new Set(),
  filters: {
    companyId: '',
    role: '',
    location: '',
    status: ''
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
  selectedContact: null
};

const contactsReducer = (state: ContactsState, action: ContactsAction): ContactsState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_CONTACTS':
      return { 
        ...state, 
        contacts: action.payload,
        loading: false,
        error: null
      };
    
    case 'SET_FILTERED_CONTACTS':
      return { 
        ...state, 
        filteredContacts: action.payload,
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
    
    case 'SELECT_CONTACT':
      return {
        ...state,
        selectedContacts: new Set([...state.selectedContacts, action.payload])
      };
    
    case 'DESELECT_CONTACT':
      const newSelection = new Set(state.selectedContacts);
      newSelection.delete(action.payload);
      return {
        ...state,
        selectedContacts: newSelection
      };
    
    case 'SELECT_ALL_CONTACTS':
      return {
        ...state,
        selectedContacts: new Set(state.filteredContacts.map(contact => contact.id))
      };
    
    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedContacts: new Set()
      };
    
    case 'SET_SELECTED_CONTACT':
      return {
        ...state,
        selectedContact: action.payload
      };
    
    case 'ADD_CONTACT':
      return {
        ...state,
        contacts: [...state.contacts, action.payload]
      };
    
    case 'UPDATE_CONTACT':
      return {
        ...state,
        contacts: state.contacts.map(contact =>
          contact.id === action.payload.id ? { ...contact, ...action.payload.data } : contact
        )
      };
    
    case 'DELETE_CONTACT':
      return {
        ...state,
        contacts: state.contacts.filter(contact => contact.id !== action.payload),
        selectedContacts: new Set([...state.selectedContacts].filter(id => id !== action.payload))
      };
    
    case 'RESET_FILTERS':
      return {
        ...state,
        filters: initialContactsState.filters,
        searchTerm: '',
        pagination: { ...state.pagination, page: 1 }
      };
    
    default:
      return state;
  }
};

interface ContactsContextType extends ContactsState {
  // Actions
  setFilters: (filters: Partial<ContactFilters>) => void;
  setSearchTerm: (term: string) => void;
  setPagination: (pagination: Partial<ContactsState['pagination']>) => void;
  selectContact: (id: string) => void;
  deselectContact: (id: string) => void;
  selectAllContacts: () => void;
  clearSelection: () => void;
  setSelectedContact: (contact: Contact | null) => void;
  resetFilters: () => void;
  
  // Operations
  createContact: (data: any) => Promise<void>;
  updateContact: (id: string, data: Partial<Contact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  refetch: () => void;
  
  // Computed values
  paginatedContacts: Contact[];
  selectedCount: number;
  stats: {
    total: number;
    filtered: number;
    active: number;
  };
}

const ContactsContext = createContext<ContactsContextType | undefined>(undefined);

export const useContactsContext = () => {
  const context = useContext(ContactsContext);
  if (!context) {
    throw new Error('useContactsContext must be used within a ContactsProvider');
  }
  return context;
};

interface ContactsProviderProps {
  children: React.ReactNode;
}

export const ContactsProvider: React.FC<ContactsProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(contactsReducer, initialContactsState);
  const { contacts, isLoading, error, refetch, createContact: createCont } = useContactsService();

  // Sync external data with internal state
  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: isLoading });
  }, [isLoading]);

  useEffect(() => {
    if (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Error al cargar contactos' });
    } else {
      dispatch({ type: 'SET_ERROR', payload: null });
    }
  }, [error]);

  useEffect(() => {
    if (contacts) {
      dispatch({ type: 'SET_CONTACTS', payload: contacts });
    }
  }, [contacts]);

  // Apply filters
  const filteredContacts = useMemo(() => {
    return state.contacts.filter(contact => {
      // Search term filter
      if (state.searchTerm) {
        const searchLower = state.searchTerm.toLowerCase();
        if (!contact.name?.toLowerCase().includes(searchLower) &&
            !contact.email?.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Other filters
      if (state.filters.companyId && contact.company_id !== state.filters.companyId) return false;
      if (state.filters.role && !contact.contact_roles?.includes(state.filters.role as any)) return false;
      if (state.filters.location && contact.city !== state.filters.location) return false;
      if (state.filters.status && contact.contact_status !== state.filters.status) return false;

      return true;
    });
  }, [state.contacts, state.searchTerm, state.filters]);

  useEffect(() => {
    dispatch({ type: 'SET_FILTERED_CONTACTS', payload: filteredContacts });
  }, [filteredContacts]);

  // Actions
  const setFilters = useCallback((filters: Partial<ContactFilters>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const setSearchTerm = useCallback((term: string) => {
    dispatch({ type: 'SET_SEARCH_TERM', payload: term });
  }, []);

  const setPagination = useCallback((pagination: Partial<ContactsState['pagination']>) => {
    dispatch({ type: 'SET_PAGINATION', payload: pagination });
  }, []);

  const selectContact = useCallback((id: string) => {
    dispatch({ type: 'SELECT_CONTACT', payload: id });
  }, []);

  const deselectContact = useCallback((id: string) => {
    dispatch({ type: 'DESELECT_CONTACT', payload: id });
  }, []);

  const selectAllContacts = useCallback(() => {
    dispatch({ type: 'SELECT_ALL_CONTACTS' });
  }, []);

  const clearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' });
  }, []);

  const setSelectedContact = useCallback((contact: Contact | null) => {
    dispatch({ type: 'SET_SELECTED_CONTACT', payload: contact });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  // Operations
  const createContact = useCallback(async (data: any) => {
    try {
      await createCont(data);
      refetch();
    } catch (error) {
      console.error('Error creating contact:', error);
    }
  }, [createCont, refetch]);

  const updateContact = useCallback(async (id: string, data: Partial<Contact>) => {
    dispatch({ type: 'UPDATE_CONTACT', payload: { id, data } });
    // TODO: Call actual update service
  }, []);

  const deleteContact = useCallback(async (id: string) => {
    dispatch({ type: 'DELETE_CONTACT', payload: id });
    // TODO: Call actual delete service
  }, []);

  // Computed values
  const paginatedContacts = useMemo(() => {
    const startIndex = (state.pagination.page - 1) * state.pagination.pageSize;
    const endIndex = startIndex + state.pagination.pageSize;
    return state.filteredContacts.slice(startIndex, endIndex);
  }, [state.filteredContacts, state.pagination.page, state.pagination.pageSize]);

  const selectedCount = useMemo(() => state.selectedContacts.size, [state.selectedContacts]);

  const stats = useMemo(() => {
    const total = state.contacts.length;
    const active = state.contacts.filter(contact => contact.contact_status === 'active').length;
    
    return {
      total,
      filtered: state.filteredContacts.length,
      active
    };
  }, [state.contacts, state.filteredContacts.length]);

  const contextValue: ContactsContextType = {
    ...state,
    setFilters,
    setSearchTerm,
    setPagination,
    selectContact,
    deselectContact,
    selectAllContacts,
    clearSelection,
    setSelectedContact,
    resetFilters,
    createContact,
    updateContact,
    deleteContact,
    refetch,
    paginatedContacts,
    selectedCount,
    stats
  };

  return (
    <ContactsContext.Provider value={contextValue}>
      {children}
    </ContactsContext.Provider>
  );
};
