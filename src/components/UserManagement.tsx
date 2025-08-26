/**
 * Refactored User Management Component
 * 
 * Now uses the new feature-based architecture with separated concerns
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useUsers, useCreateUser, useRemoveUserRole, useDeleteUser } from '@/features/user-management/hooks/useUserManagement';
import { CreateUserForm } from '@/features/user-management/components/CreateUserForm';
import { UserManagementTable } from '@/features/user-management/components/UserManagementTable';
import { User, CreateUserData, UserRole } from '@/features/user-management/services/UserManagementService';
import EditUserDialog from './EditUserDialog';

const UserManagement = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Hooks from the new feature-based architecture
  const { data: users, isLoading } = useUsers();
  const createUserMutation = useCreateUser();
  const removeRoleMutation = useRemoveUserRole();
  const deleteUserMutation = useDeleteUser();

  const handleCreateUser = (userData: CreateUserData, photo?: File) => {
    createUserMutation.mutate(
      { userData, photo },
      {
        onSuccess: () => {
          setIsCreateDialogOpen(false);
        }
      }
    );
  };

  const handleEditUser = (user: User) => {
    const editableUser = {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      is_manager: user.is_manager,
      manager_name: user.manager_name,
      manager_position: user.manager_position,
    };
    setEditingUser(editableUser);
    setIsEditDialogOpen(true);
  };

  const handleRemoveRole = (userId: string, role: UserRole) => {
    removeRoleMutation.mutate({ userId, role });
  };

  const handleDeleteUser = (userId: string) => {
    deleteUserMutation.mutate(userId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">
            Administra usuarios, roles y permisos del sistema
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario</DialogTitle>
              <DialogDescription>
                Completa la información para crear un nuevo usuario en el sistema
              </DialogDescription>
            </DialogHeader>
            <CreateUserForm
              onSubmit={handleCreateUser}
              isSubmitting={createUserMutation.isPending}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <UserManagementTable
        users={users || []}
        isLoading={isLoading}
        onEditUser={handleEditUser}
        onRemoveRole={handleRemoveRole}
        onDeleteUser={handleDeleteUser}
      />

      <EditUserDialog
        user={editingUser}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setEditingUser(null);
          setIsEditDialogOpen(false);
        }}
      />
    </div>
  );
};

export default UserManagement;