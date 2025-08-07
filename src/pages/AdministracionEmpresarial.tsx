import React from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import EnterpriseAdminDashboard from '@/components/admin/EnterpriseAdminDashboard';

const AdministracionEmpresarial: React.FC = () => {
  const { role, loading } = useUserRole();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  if (role !== 'admin' && role !== 'superadmin') {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-800 mb-2">Acceso Restringido</h3>
          <p className="text-red-700">
            No tienes permisos para acceder a la administración empresarial. Se requieren permisos de administrador.
          </p>
        </div>
      </div>
    );
  }

  return <EnterpriseAdminDashboard />;
};

export default AdministracionEmpresarial;