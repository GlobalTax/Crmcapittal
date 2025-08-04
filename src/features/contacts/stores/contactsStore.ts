import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { BaseStore } from '@/shared/types/common';
import { Contact, ContactFilters } from '../types';

interface ContactsState {
  contacts: Contact[];
  selectedContacts: Set<string>;
  filters: ContactFilters;
  searchTerm: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  selectedContact: Contact | null;
}

interface ContactsActions {
  // CRUD operations
  setContacts: (contacts: Contact[]) => void;
  addContact: (contact: Contact) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  removeContact: (id: string) => void;
  
  // Selection management
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  setSelectedContact: (contact: Contact | null) => void;
  
  // Filtering and search
  setFilters: (filters: Partial<ContactFilters>) => void;
  setSearchTerm: (term: string) => void;
  resetFilters: () => void;
  
  // Sorting
  setSortBy: (field: string) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  
  // Pagination
  setPagination: (pagination: Partial<ContactsState['pagination']>) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
}

type ContactsStore = BaseStore & ContactsState & ContactsActions;

const initialFilters: ContactFilters = {
  search: '',
  companyId: '',
  contact_type: undefined,
  contact_status: undefined,
  lifecycle_stage: undefined,
  contact_priority: undefined,
};

export const useContactsStore = create<ContactsStore>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Base store
        loading: false,
        error: null,
        
        // Contacts state
        contacts: [],
        selectedContacts: new Set(),
        filters: initialFilters,
        searchTerm: '',
        sortBy: 'name',
        sortOrder: 'asc',
        pagination: {
          page: 1,
          pageSize: 20,
          totalItems: 0,
          totalPages: 0,
        },
        selectedContact: null,

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

        // CRUD operations
        setContacts: (contacts) => {
          set((state) => {
            state.contacts = contacts;
            state.selectedContacts.clear();
            state.pagination.totalItems = contacts.length;
            state.pagination.totalPages = Math.ceil(contacts.length / state.pagination.pageSize);
          });
        },

        addContact: (contact) => {
          set((state) => {
            state.contacts.unshift(contact);
            state.pagination.totalItems = state.contacts.length;
            state.pagination.totalPages = Math.ceil(state.contacts.length / state.pagination.pageSize);
          });
        },

        updateContact: (id, updates) => {
          set((state) => {
            const index = state.contacts.findIndex(contact => contact.id === id);
            if (index !== -1) {
              state.contacts[index] = { ...state.contacts[index], ...updates };
            }
            
            // Update selected contact if it's the one being updated
            if (state.selectedContact?.id === id) {
              state.selectedContact = { ...state.selectedContact, ...updates };
            }
          });
        },

        removeContact: (id) => {
          set((state) => {
            state.contacts = state.contacts.filter(contact => contact.id !== id);
            state.selectedContacts.delete(id);
            state.pagination.totalItems = state.contacts.length;
            state.pagination.totalPages = Math.ceil(state.contacts.length / state.pagination.pageSize);
            
            // Clear selected contact if it's the one being removed
            if (state.selectedContact?.id === id) {
              state.selectedContact = null;
            }
          });
        },

        // Selection management
        toggleSelection: (id) => {
          set((state) => {
            if (state.selectedContacts.has(id)) {
              state.selectedContacts.delete(id);
            } else {
              state.selectedContacts.add(id);
            }
          });
        },

        selectAll: () => {
          set((state) => {
            const allContacts = state.contacts;
            state.selectedContacts = new Set(allContacts.map(contact => contact.id));
          });
        },

        clearSelection: () => {
          set((state) => {
            state.selectedContacts.clear();
          });
        },

        setSelectedContact: (contact) => {
          set((state) => {
            state.selectedContact = contact;
          });
        },

        // Filtering and search
        setFilters: (filters) => {
          set((state) => {
            state.filters = { ...state.filters, ...filters };
            state.pagination.page = 1; // Reset to first page when filters change
          });
        },

        setSearchTerm: (term) => {
          set((state) => {
            state.searchTerm = term;
            state.pagination.page = 1;
          });
        },

        resetFilters: () => {
          set((state) => {
            state.filters = initialFilters;
            state.searchTerm = '';
            state.pagination.page = 1;
          });
        },

        // Sorting
        setSortBy: (field) => {
          set((state) => {
            state.sortBy = field;
          });
        },

        setSortOrder: (order) => {
          set((state) => {
            state.sortOrder = order;
          });
        },

        // Pagination
        setPagination: (pagination) => {
          set((state) => {
            state.pagination = { ...state.pagination, ...pagination };
          });
        },

        setPage: (page) => {
          set((state) => {
            state.pagination.page = page;
          });
        },

        setPageSize: (pageSize) => {
          set((state) => {
            state.pagination.pageSize = pageSize;
            state.pagination.totalPages = Math.ceil(state.contacts.length / pageSize);
            state.pagination.page = 1; // Reset to first page
          });
        },

      }))
    ),
    {
      name: 'contacts-store',
    }
  )
);

// Selectors
export const useContacts = () => useContactsStore((state) => state.contacts);
export const useContactsLoading = () => useContactsStore((state) => state.loading);
export const useContactsError = () => useContactsStore((state) => state.error);
export const useSelectedContacts = () => useContactsStore((state) => state.selectedContacts);
export const useSelectedContact = () => useContactsStore((state) => state.selectedContact);
export const useContactsFilters = () => useContactsStore((state) => state.filters);
export const useContactsSearchTerm = () => useContactsStore((state) => state.searchTerm);
export const useContactsPagination = () => useContactsStore((state) => state.pagination);

// Computed selectors
export const useFilteredContacts = () => {
  return useContactsStore((state) => state.contacts.filter(contact => {
    // Search term filter
    if (state.searchTerm) {
      const searchLower = state.searchTerm.toLowerCase();
      const matchesSearch = 
        contact.name?.toLowerCase().includes(searchLower) ||
        contact.email?.toLowerCase().includes(searchLower) ||
        contact.company_name?.toLowerCase().includes(searchLower) ||
        contact.position?.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Apply other filters
    if (state.filters.companyId && contact.company_id !== state.filters.companyId) return false;
    if (state.filters.contact_type && contact.contact_type !== state.filters.contact_type) return false;
    if (state.filters.contact_status && contact.contact_status !== state.filters.contact_status) return false;
    if (state.filters.lifecycle_stage && contact.lifecycle_stage !== state.filters.lifecycle_stage) return false;
    if (state.filters.contact_priority && contact.contact_priority !== state.filters.contact_priority) return false;

    return true;
  }));
};

export const useSortedContacts = () => {
  const contacts = useContacts();
  const searchTerm = useContactsSearchTerm();
  const filters = useContactsFilters();
  const sortBy = useContactsStore((state) => state.sortBy);
  const sortOrder = useContactsStore((state) => state.sortOrder);
  
  // Apply filtering
  const filtered = contacts.filter(contact => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        contact.name?.toLowerCase().includes(searchLower) ||
        contact.email?.toLowerCase().includes(searchLower) ||
        contact.company_name?.toLowerCase().includes(searchLower) ||
        contact.position?.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    if (filters.companyId && contact.company_id !== filters.companyId) return false;
    if (filters.contact_type && contact.contact_type !== filters.contact_type) return false;
    if (filters.contact_status && contact.contact_status !== filters.contact_status) return false;
    if (filters.lifecycle_stage && contact.lifecycle_stage !== filters.lifecycle_stage) return false;
    if (filters.contact_priority && contact.contact_priority !== filters.contact_priority) return false;

    return true;
  });
  
  // Apply sorting
  return [...filtered].sort((a, b) => {
    const aValue = a[sortBy as keyof Contact] as string || '';
    const bValue = b[sortBy as keyof Contact] as string || '';
    
    const comparison = aValue.localeCompare(bValue, 'es', { numeric: true });
    return sortOrder === 'asc' ? comparison : -comparison;
  });
};

export const usePaginatedContacts = () => {
  const sortedContacts = useSortedContacts();
  const pagination = useContactsPagination();
  const startIndex = (pagination.page - 1) * pagination.pageSize;
  const endIndex = startIndex + pagination.pageSize;
  
  return sortedContacts.slice(startIndex, endIndex);
};