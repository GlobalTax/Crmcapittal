import { useUserRole } from '@/hooks/useUserRole';
import UserManagement from '@/components/UserManagement';

export default function MinimalUserManagement() {
  const { role, loading } = useUserRole();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando permisos...</p>
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
            No tienes permisos para acceder a esta página. Se requieren permisos de administrador.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <p className="text-gray-600 mt-1">
          Administra usuarios, roles y permisos del sistema
        </p>
      </div>
      <UserManagement />
    </div>
  );
}