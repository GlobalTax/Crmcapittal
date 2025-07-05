import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Lead, CreateLeadData, UpdateLeadData, LeadStatus } from '@/types/Lead';
import * as leadsService from '@/services/leadsService';
import { toast } from 'sonner';
import { useOptimizedPolling } from './useOptimizedPolling';

export const useOptimizedLeads = (filters?: {
  status?: LeadStatus;
  assigned_to_id?: string;
}) => {
  const queryClient = useQueryClient();
  const cacheKey = `leads_${JSON.stringify(filters || {})}`;

  const {
    data: leads = [],
    loading: isLoading,
    error,
    refetch
  } = useOptimizedPolling({
    queryKey: cacheKey,
    queryFn: () => leadsService.fetchLeads(filters),
    interval: 240000, // 4 minutes - more conservative
    priority: 'medium',
    cacheTtl: 180000, // 3 minutes cache
    enabled: true
  });

  const createMutation = useMutation({
    mutationFn: leadsService.createLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      refetch(); // Refresh our data
      toast.success('Lead creado exitosamente');
    },
    onError: (error) => {
      console.error('Error creating lead:', error);
      toast.error('Error al crear el lead');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateLeadData }) =>
      leadsService.updateLead(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      refetch(); // Refresh our data
      toast.success('Lead actualizado exitosamente');
    },
    onError: (error) => {
      console.error('Error updating lead:', error);
      toast.error('Error al actualizar el lead');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: leadsService.deleteLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      refetch(); // Refresh our data
      toast.success('Lead eliminado exitosamente');
    },
    onError: (error) => {
      console.error('Error deleting lead:', error);
      toast.error('Error al eliminar el lead');
    },
  });

  return {
    leads,
    isLoading,
    error,
    refetch,
    createLead: createMutation.mutate,
    updateLead: updateMutation.mutate,
    deleteLead: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};