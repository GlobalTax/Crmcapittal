import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserService, CreateUserData, UpdateUserData } from '@/services';
import { toast } from 'sonner';

export const useUsersService = () => {
  const queryClient = useQueryClient();

  // Query for getting all users
  const {
    data: users = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const result = await UserService.getUsers();
      if (!result.success || result.error) {
        throw new Error(result.error || 'Error al cargar usuarios');
      }
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Mutation for creating users
  const createUserMutation = useMutation({
    mutationFn: async (userData: CreateUserData) => {
      const result = await UserService.createUser(userData);
      if (!result.success || result.error) {
        throw new Error(result.error || 'Error al crear usuario');
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuario creado exitosamente');
    },
    onError: (error: Error) => {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Error al crear usuario');
    },
  });

  // Mutation for updating users
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: UpdateUserData }) => {
      const result = await UserService.updateUser(userId, updates);
      if (!result.success || result.error) {
        throw new Error(result.error || 'Error al actualizar usuario');
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuario actualizado exitosamente');
    },
    onError: (error: Error) => {
      console.error('Error updating user:', error);
      toast.error(error.message || 'Error al actualizar usuario');
    },
  });

  // Mutation for deleting users
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const result = await UserService.deleteUser(userId);
      if (!result.success || result.error) {
        throw new Error(result.error || 'Error al eliminar usuario');
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuario eliminado exitosamente');
    },
    onError: (error: Error) => {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Error al eliminar usuario');
    },
  });

  // Mutation for removing user roles
  const removeUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const result = await UserService.removeUserRole(userId, role);
      if (!result.success || result.error) {
        throw new Error(result.error || 'Error al remover rol');
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Rol removido exitosamente');
    },
    onError: (error: Error) => {
      console.error('Error removing user role:', error);
      toast.error(error.message || 'Error al remover rol');
    },
  });

  return {
    // Data
    users,
    isLoading,
    error,
    refetch,
    
    // Actions
    createUser: createUserMutation.mutate,
    updateUser: updateUserMutation.mutate,
    deleteUser: deleteUserMutation.mutate,
    removeUserRole: removeUserRoleMutation.mutate,
    
    // Status
    isCreating: createUserMutation.isPending,
    isUpdating: updateUserMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
    isRemovingRole: removeUserRoleMutation.isPending,
  };
};