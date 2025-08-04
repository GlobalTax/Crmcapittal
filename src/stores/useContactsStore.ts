import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { BaseStore } from './types';

interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  created_at: string;
  updated_at: string;
  // Add other contact fields as needed
}

interface ContactsState {
  contacts: Contact[];
  selectedContacts: Set<string>;
  filters: Record<string, any>;
  searchTerm: string;
}

interface ContactsActions {
  setContacts: (contacts: Contact[]) => void;
  addContact: (contact: Contact) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  removeContact: (id: string) => void;
  setFilters: (filters: Record<string, any>) => void;
  setSearchTerm: (term: string) => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
}

type ContactsStore = BaseStore & ContactsState & ContactsActions;

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

        // Contacts actions
        setContacts: (contacts) => {
          set((state) => {
            state.contacts = contacts;
            state.selectedContacts.clear();
          });
        },

        addContact: (contact) => {
          set((state) => {
            state.contacts.unshift(contact);
          });
        },

        updateContact: (id, updates) => {
          set((state) => {
            const index = state.contacts.findIndex(contact => contact.id === id);
            if (index !== -1) {
              state.contacts[index] = { ...state.contacts[index], ...updates };
            }
          });
        },

        removeContact: (id) => {
          set((state) => {
            state.contacts = state.contacts.filter(contact => contact.id !== id);
            state.selectedContacts.delete(id);
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
            if (state.selectedContacts.has(id)) {
              state.selectedContacts.delete(id);
            } else {
              state.selectedContacts.add(id);
            }
          });
        },

        clearSelection: () => {
          set((state) => {
            state.selectedContacts.clear();
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