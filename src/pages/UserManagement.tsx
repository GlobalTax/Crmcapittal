import React from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import UserManagement from '@/components/UserManagement';
import RolePermissionMatrix from '@/components/RolePermissionMatrix';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/ui/page-header';
import { Shield, Users, Settings } from 'lucide-react';
import { useHasPermission, PERMISSIONS } from '@/hooks/usePermissions';

const UserManagementPage = () => {
  const { role, loading } = useUserRole();
  const { data: canReadUsers, isLoading: loadingPermissions } = useHasPermission(PERMISSIONS.USERS_READ);
  const { data: canManagePermissions, isLoading: loadingPermissionsCheck } = useHasPermission(PERMISSIONS.USERS_MANAGE_ROLES);

  if (loading || loadingPermissions || loadingPermissionsCheck) {
    return <LoadingSkeleton />;
  }

  // Verificar permisos granulares primero
  if (!canReadUsers) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            No tienes permisos para ver usuarios. Contacta con un administrador.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Verificación de respaldo para usuarios sin el nuevo sistema de permisos
  if (!role || !['admin', 'superadmin', 'manager'].includes(role)) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            No tienes permisos para acceder a esta página. Se requieren permisos de administrador.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <PageHeader
        title="Gestión de Usuarios"
        description="Administra usuarios, roles y permisos del sistema"
        badge={{ text: "Admin", variant: "outline" }}
      />
      
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Gestión de Usuarios
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2" disabled={!canManagePermissions}>
            <Settings className="h-4 w-4" />
            Roles y Permisos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <UserManagement />
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          {canManagePermissions ? (
            <RolePermissionMatrix />
          ) : (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                No tienes permisos para gestionar roles y permisos del sistema.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagementPage;