/**
 * User Management Hooks
 * 
 * React Query hooks for user management operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { UserManagementService, CreateUserData, UserRole } from '../services/UserManagementService';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users-with-roles-complete'],
    queryFn: UserManagementService.fetchUsersWithRoles,
  });
};

export const useCreateUser = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userData, photo }: { userData: CreateUserData; photo?: File }) => {
      return await UserManagementService.createUser(userData, photo);
    },
    onSuccess: () => {
      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['users-with-roles-complete'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useRemoveUserRole = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole }) => {
      return await UserManagementService.removeUserRole(userId, role);
    },
    onSuccess: (data) => {
      toast({
        title: "Rol removido",
        description: data.message || "El rol del usuario ha sido removido",
      });
      queryClient.invalidateQueries({ queryKey: ['users-with-roles-complete'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteUser = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      return await UserManagementService.deleteUser(userId);
    },
    onSuccess: (data) => {
      toast({
        title: "Usuario eliminado",
        description: data.message || "El usuario ha sido eliminado completamente del sistema",
      });
      queryClient.invalidateQueries({ queryKey: ['users-with-roles-complete'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};