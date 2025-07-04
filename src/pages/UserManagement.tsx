import React from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import UserManagement from '@/components/UserManagement';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

const UserManagementPage = () => {
  const { role, loading } = useUserRole();

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (role !== 'admin' && role !== 'superadmin') {
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <p className="text-gray-600 mt-2">
          Administra usuarios, roles y permisos del sistema
        </p>
      </div>
      <UserManagement />
    </div>
  );
};

export default UserManagementPage;