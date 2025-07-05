import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Contact, CreateContactData, UpdateContactData } from "@/types/Contact";
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from "sonner";

interface UseContactsOptimizedOptions {
  pageSize?: number;
  enableSearch?: boolean;
  enableFilters?: boolean;
}

export function useContactsOptimized(options: UseContactsOptimizedOptions = {}) {
  const {
    pageSize = 50,
    enableSearch = true,
    enableFilters = true
  } = options;

  // State
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Debounced search
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch contacts
  const fetchContacts = async (page = 1, search = '', filtersObj = {}) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('contacts')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (search && enableSearch) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`);
      }

      if (enableFilters) {
        Object.entries(filtersObj).forEach(([key, value]) => {
          if (value && value !== 'all') {
            query = query.eq(key, value);
          }
        });
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setContacts((data || []) as Contact[]);
      setTotalCount(count || 0);
      return data;
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Error al cargar contactos');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered contacts
  const filteredContacts = useMemo(() => {
    let result = contacts;

    if (debouncedSearchTerm && enableSearch) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      result = result.filter(contact =>
        contact.name.toLowerCase().includes(searchLower) ||
        contact.email?.toLowerCase().includes(searchLower) ||
        contact.company?.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }, [contacts, debouncedSearchTerm, enableSearch]);

  // CRUD Operations
  const createContact = async (contactData: CreateContactData) => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert([contactData])
        .select()
        .single();

      if (error) throw error;
      toast.success('Contacto creado exitosamente');
      await fetchContacts(currentPage, debouncedSearchTerm, filters);
      return data;
    } catch (error) {
      console.error('Error creating contact:', error);
      toast.error('Error al crear contacto');
      return null;
    }
  };

  const updateContact = async (id: string, contactData: UpdateContactData) => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .update(contactData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      toast.success('Contacto actualizado exitosamente');
      
      setContacts(prev => prev.map(contact => 
        contact.id === id ? { ...contact, ...data } as Contact : contact
      ));
      
      return data;
    } catch (error) {
      console.error('Error updating contact:', error);
      toast.error('Error al actualizar contacto');
      return null;
    }
  };

  const deleteContact = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Contacto eliminado exitosamente');
      
      setContacts(prev => prev.filter(contact => contact.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Error al eliminar contacto');
      return false;
    }
  };

  // Effects
  useEffect(() => {
    fetchContacts(currentPage, debouncedSearchTerm, filters);
  }, [currentPage, debouncedSearchTerm, filters]);

  return {
    contacts: filteredContacts,
    totalCount,
    currentPage,
    totalPages: Math.ceil(totalCount / pageSize),
    isLoading,
    searchTerm,
    filters,
    handleSearch: (term: string) => setSearchTerm(term),
    handleFilter: (newFilters: Record<string, any>) => setFilters(newFilters),
    handlePageChange: (page: number) => setCurrentPage(page),
    createContact,
    updateContact,
    deleteContact,
    refetch: () => fetchContacts(currentPage, debouncedSearchTerm, filters)
  };
}