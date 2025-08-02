import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CompanyService, CreateCompanyData, FilterParams, PaginationParams } from '@/services';
import { toast } from 'sonner';

interface UseCompaniesOptions extends FilterParams, PaginationParams {}

export const useCompaniesService = (options: UseCompaniesOptions = {}) => {
  const queryClient = useQueryClient();

  // Query for getting companies
  const {
    data: companies = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['companies', options],
    queryFn: async () => {
      const result = await CompanyService.getCompanies(options);
      if (!result.success || result.error) {
        throw new Error(result.error || 'Error al cargar empresas');
      }
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Mutation for creating companies
  const createCompanyMutation = useMutation({
    mutationFn: async (companyData: CreateCompanyData) => {
      const result = await CompanyService.createCompany(companyData);
      if (!result.success || result.error) {
        throw new Error(result.error || 'Error al crear empresa');
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Empresa creada exitosamente');
    },
    onError: (error: Error) => {
      console.error('Error creating company:', error);
      toast.error(error.message || 'Error al crear empresa');
    },
  });

  // Mutation for updating companies
  const updateCompanyMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CreateCompanyData> }) => {
      const result = await CompanyService.updateCompany(id, updates);
      if (!result.success || result.error) {
        throw new Error(result.error || 'Error al actualizar empresa');
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Empresa actualizada exitosamente');
    },
    onError: (error: Error) => {
      console.error('Error updating company:', error);
      toast.error(error.message || 'Error al actualizar empresa');
    },
  });

  // Mutation for deleting companies
  const deleteCompanyMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await CompanyService.deleteCompany(id);
      if (!result.success || result.error) {
        throw new Error(result.error || 'Error al eliminar empresa');
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Empresa eliminada exitosamente');
    },
    onError: (error: Error) => {
      console.error('Error deleting company:', error);
      toast.error(error.message || 'Error al eliminar empresa');
    },
  });

  return {
    // Data
    companies,
    isLoading,
    error,
    refetch,
    
    // Actions
    createCompany: createCompanyMutation.mutate,
    updateCompany: updateCompanyMutation.mutate,
    deleteCompany: deleteCompanyMutation.mutate,
    
    // Status
    isCreating: createCompanyMutation.isPending,
    isUpdating: updateCompanyMutation.isPending,
    isDeleting: deleteCompanyMutation.isPending,
  };
};

export const useCompanyService = (id: string) => {
  const queryClient = useQueryClient();

  // Query for getting single company
  const {
    data: company,
    isLoading,
    error
  } = useQuery({
    queryKey: ['company', id],
    queryFn: async () => {
      const result = await CompanyService.getCompanyById(id);
      if (!result.success || result.error) {
        throw new Error(result.error || 'Error al cargar empresa');
      }
      return result.data;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });

  // Query for company activities
  const {
    data: activities = [],
    isLoading: isLoadingActivities
  } = useQuery({
    queryKey: ['company-activities', id],
    queryFn: async () => {
      const result = await CompanyService.getCompanyActivities(id);
      if (!result.success || result.error) {
        throw new Error(result.error || 'Error al cargar actividades');
      }
      return result.data || [];
    },
    enabled: !!id,
  });

  // Query for company notes
  const {
    data: notes = [],
    isLoading: isLoadingNotes
  } = useQuery({
    queryKey: ['company-notes', id],
    queryFn: async () => {
      const result = await CompanyService.getCompanyNotes(id);
      if (!result.success || result.error) {
        throw new Error(result.error || 'Error al cargar notas');
      }
      return result.data || [];
    },
    enabled: !!id,
  });

  // Query for company files
  const {
    data: files = [],
    isLoading: isLoadingFiles
  } = useQuery({
    queryKey: ['company-files', id],
    queryFn: async () => {
      const result = await CompanyService.getCompanyFiles(id);
      if (!result.success || result.error) {
        throw new Error(result.error || 'Error al cargar archivos');
      }
      return result.data || [];
    },
    enabled: !!id,
  });

  // Mutation for creating notes
  const createNoteMutation = useMutation({
    mutationFn: async ({ note, noteType }: { note: string; noteType?: string }) => {
      const result = await CompanyService.createCompanyNote(id, note, noteType);
      if (!result.success || result.error) {
        throw new Error(result.error || 'Error al crear nota');
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-notes', id] });
      toast.success('Nota creada exitosamente');
    },
    onError: (error: Error) => {
      console.error('Error creating note:', error);
      toast.error(error.message || 'Error al crear nota');
    },
  });

  // Mutation for deleting notes
  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const result = await CompanyService.deleteCompanyNote(noteId);
      if (!result.success || result.error) {
        throw new Error(result.error || 'Error al eliminar nota');
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-notes', id] });
      toast.success('Nota eliminada exitosamente');
    },
    onError: (error: Error) => {
      console.error('Error deleting note:', error);
      toast.error(error.message || 'Error al eliminar nota');
    },
  });

  return {
    // Data
    company,
    activities,
    notes,
    files,
    
    // Loading states
    isLoading,
    isLoadingActivities,
    isLoadingNotes,
    isLoadingFiles,
    
    // Error
    error,
    
    // Actions
    createNote: createNoteMutation.mutate,
    deleteNote: deleteNoteMutation.mutate,
    
    // Status
    isCreatingNote: createNoteMutation.isPending,
    isDeletingNote: deleteNoteMutation.isPending,
  };
};