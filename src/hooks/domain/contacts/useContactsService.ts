import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ContactService, ContactFilters, PaginationParams } from '@/services';
import { toast } from 'sonner';

interface UseContactsOptions extends ContactFilters, PaginationParams {}

export const useContactsService = (options: UseContactsOptions = {}) => {
  const queryClient = useQueryClient();

  const {
    data: contacts = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['contacts', options],
    queryFn: async () => {
      const result = await ContactService.getContacts(options);
      if (!result.success || result.error) {
        throw new Error(result.error || 'Error al cargar contactos');
      }
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const createContactMutation = useMutation({
    mutationFn: ContactService.createContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contacto creado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear contacto');
    },
  });

  return {
    contacts,
    isLoading,
    error,
    refetch,
    createContact: createContactMutation.mutate,
    isCreating: createContactMutation.isPending,
  };
};