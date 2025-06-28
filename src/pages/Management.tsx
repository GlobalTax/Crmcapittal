
import React from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import UserManagement from '@/components/UserManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Management = () => {
  const { role, loading } = useUserRole();

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (role !== 'admin' && role !== 'superadmin') {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Acceso Denegado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              No tienes permisos para acceder a esta sección.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
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

export default Management;
