import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useOperationsContext } from '@/contexts/operations/OperationsProvider';
import { useCompaniesContext } from '@/contexts/companies/CompaniesProvider';
import { useContactsContext } from '@/contexts/contacts/ContactsProvider';
import { useUsersContext } from '@/contexts/users/UsersProvider';

export interface GlobalSearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'operation' | 'company' | 'contact' | 'user';
  url: string;
  avatar?: string;
  metadata?: Record<string, any>;
}

interface GlobalSearchState {
  query: string;
  results: GlobalSearchResult[];
  loading: boolean;
  activeFilter: 'all' | 'operations' | 'companies' | 'contacts' | 'users';
}

interface GlobalSearchContextType extends GlobalSearchState {
  setQuery: (query: string) => void;
  setActiveFilter: (filter: GlobalSearchState['activeFilter']) => void;
  clearSearch: () => void;
  filteredResults: GlobalSearchResult[];
  searchStats: {
    total: number;
    operations: number;
    companies: number;
    contacts: number;
    users: number;
  };
}

const GlobalSearchContext = createContext<GlobalSearchContextType | undefined>(undefined);

export const useGlobalSearch = () => {
  const context = useContext(GlobalSearchContext);
  if (!context) {
    throw new Error('useGlobalSearch must be used within a GlobalSearchProvider');
  }
  return context;
};

interface GlobalSearchProviderProps {
  children: React.ReactNode;
}

export const GlobalSearchProvider: React.FC<GlobalSearchProviderProps> = ({ children }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<GlobalSearchState['activeFilter']>('all');

  // Get data from all domain contexts
  const { operations } = useOperationsContext();
  const { companies } = useCompaniesContext();
  const { contacts } = useContactsContext();
  const { users } = useUsersContext();

  // Transform data to search results
  const searchResults = useMemo((): GlobalSearchResult[] => {
    if (!query.trim()) return [];
    
    const queryLower = query.toLowerCase();
    const results: GlobalSearchResult[] = [];

    // Search operations
    operations
      .filter(op => 
        op.company_name?.toLowerCase().includes(queryLower) ||
        op.sector?.toLowerCase().includes(queryLower) ||
        op.operation_type?.toLowerCase().includes(queryLower)
      )
      .forEach(op => {
        results.push({
          id: op.id,
          title: op.company_name || 'Sin nombre',
          subtitle: `${op.operation_type} • ${op.sector}`,
          type: 'operation',
          url: `/operations/${op.id}`,
          metadata: {
            amount: op.amount,
            status: op.status
          }
        });
      });

    // Search companies
    companies
      .filter(company => 
        company.name?.toLowerCase().includes(queryLower) ||
        company.industry?.toLowerCase().includes(queryLower) ||
        company.address?.toLowerCase().includes(queryLower)
      )
      .forEach(company => {
        results.push({
          id: company.id,
          title: company.name || 'Sin nombre',
          subtitle: `${company.industry} • ${company.address}`,
          type: 'company',
          url: `/companies/${company.id}`,
          metadata: {
            annual_revenue: company.annual_revenue,
            status: company.company_status
          }
        });
      });

    // Search contacts
    contacts
      .filter(contact => 
        contact.name?.toLowerCase().includes(queryLower) ||
        contact.email?.toLowerCase().includes(queryLower) ||
        contact.contact_roles?.some(role => role.toLowerCase().includes(queryLower))
      )
      .forEach(contact => {
        results.push({
          id: contact.id,
          title: contact.name || 'Sin nombre',
          subtitle: `${contact.contact_roles?.[0] || 'Sin rol'} • ${contact.email}`,
          type: 'contact',
          url: `/contacts/${contact.id}`,
          avatar: contact.photo_url,
          metadata: {
            company_id: contact.company_id,
            status: contact.contact_status
          }
        });
      });

    // Search users
    users
      .filter(user => 
        user.full_name?.toLowerCase().includes(queryLower) ||
        user.email?.toLowerCase().includes(queryLower) ||
        user.role?.toLowerCase().includes(queryLower)
      )
      .forEach(user => {
        results.push({
          id: user.id,
          title: user.full_name || 'Sin nombre',
          subtitle: `${user.role} • ${user.email}`,
          type: 'user',
          url: `/users/${user.id}`,
          avatar: user.avatar_url,
          metadata: {
            department: user.department,
            status: user.status
          }
        });
      });

    return results.slice(0, 50); // Limit results for performance
  }, [query, operations, companies, contacts, users]);

  // Filter results based on active filter
  const filteredResults = useMemo(() => {
    if (activeFilter === 'all') return searchResults;
    
    const typeMap = {
      operations: 'operation',
      companies: 'company',
      contacts: 'contact',
      users: 'user'
    };
    
    return searchResults.filter(result => result.type === typeMap[activeFilter]);
  }, [searchResults, activeFilter]);

  // Calculate search stats
  const searchStats = useMemo(() => {
    const stats = {
      total: searchResults.length,
      operations: 0,
      companies: 0,
      contacts: 0,
      users: 0
    };

    searchResults.forEach(result => {
      switch (result.type) {
        case 'operation':
          stats.operations++;
          break;
        case 'company':
          stats.companies++;
          break;
        case 'contact':
          stats.contacts++;
          break;
        case 'user':
          stats.users++;
          break;
      }
    });

    return stats;
  }, [searchResults]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setActiveFilter('all');
  }, []);

  const contextValue: GlobalSearchContextType = {
    query,
    results: searchResults,
    loading,
    activeFilter,
    setQuery,
    setActiveFilter,
    clearSearch,
    filteredResults,
    searchStats
  };

  return (
    <GlobalSearchContext.Provider value={contextValue}>
      {children}
    </GlobalSearchContext.Provider>
  );
};