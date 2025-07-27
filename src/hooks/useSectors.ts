
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sector, CreateSectorData, UpdateSectorData } from '@/types/Sector';
import * as sectorsService from '@/services/sectorsService';
import { toast } from 'sonner';

export const useSectors = () => {
  const queryClient = useQueryClient();

  const {
    data: sectors = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['sectors'],
    queryFn: sectorsService.fetchSectors,
  });

  const createMutation = useMutation({
    mutationFn: sectorsService.createSector,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sectors'] });
      toast.success('Sector creado exitosamente');
    },
    onError: (error) => {
      console.error('Error creating sector:', error);
      toast.error('Error al crear el sector');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateSectorData }) =>
      sectorsService.updateSector(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sectors'] });
      toast.success('Sector actualizado exitosamente');
    },
    onError: (error) => {
      console.error('Error updating sector:', error);
      toast.error('Error al actualizar el sector');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: sectorsService.deleteSector,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sectors'] });
      toast.success('Sector eliminado exitosamente');
    },
    onError: (error) => {
      console.error('Error deleting sector:', error);
      toast.error('Error al eliminar el sector');
    },
  });

  return {
    sectors,
    isLoading,
    error,
    refetch,
    createSector: createMutation.mutate,
    updateSector: updateMutation.mutate,
    deleteSector: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const useSector = (id: string) => {
  const {
    data: sector,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['sector', id],
    queryFn: () => sectorsService.fetchSectorById(id),
    enabled: !!id,
  });

  return { sector, isLoading, error, refetch };
};
