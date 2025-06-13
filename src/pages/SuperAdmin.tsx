
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut, Users, BarChart3, Settings, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import UserManagement from "@/components/UserManagement";

const SuperAdmin = () => {
  const { signOut, user } = useAuth();
  const { role, loading } = useUserRole();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'analytics' | 'settings'>('overview');

  // Fetch user statistics
  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      console.log('Fetching user statistics...');
      
      const { data, error } = await supabase.rpc('get_users_with_roles');
      
      if (error) {
        console.error('Error fetching user stats:', error);
        throw error;
      }

      console.log('User stats data:', data);

      // Count users by role
      const adminCount = data?.filter(u => u.role === 'admin').length || 0;
      const superadminCount = data?.filter(u => u.role === 'superadmin').length || 0;
      const userCount = data?.filter(u => u.role === 'user').length || 0;
      const totalUsers = data?.length || 0;

      return {
        adminCount,
        superadminCount,
        userCount,
        totalUsers
      };
    },
  });

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-black text-xs">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (role !== 'superadmin') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-lg font-bold text-black mb-2">Acceso Denegado</h1>
          <p className="text-black mb-2 text-sm">No tienes permisos de superadministrador</p>
          <Link to="/admin">
            <Button size="sm">Ir al Panel de Admin</Button>
          </Link>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement />;
      case 'analytics':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-black p-6">
            <h2 className="text-lg font-semibold text-black mb-4">Analytics Avanzados</h2>
            <p className="text-black text-sm">Funcionalidad de analytics en desarrollo...</p>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-black p-6">
            <h2 className="text-lg font-semibold text-black mb-4">Configuración Global</h2>
            <p className="text-black text-sm">Configuración del sistema en desarrollo...</p>
          </div>
        );
      default:
        return (
          <>
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-black hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-blue-50 rounded-lg mr-4">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-black">Gestión de Usuarios</h3>
                    <p className="text-xs text-gray-600">Administrar roles y permisos</p>
                  </div>
                </div>
                <Button className="w-full text-sm" size="sm" onClick={() => setActiveTab('users')}>
                  Gestionar Usuarios
                </Button>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-black hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-green-50 rounded-lg mr-4">
                    <BarChart3 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-black">Analytics Avanzados</h3>
                    <p className="text-xs text-gray-600">Reportes y métricas globales</p>
                  </div>
                </div>
                <Button className="w-full text-sm" size="sm" onClick={() => setActiveTab('analytics')}>
                  Ver Analytics
                </Button>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-black hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-purple-50 rounded-lg mr-4">
                    <Settings className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-black">Configuración Global</h3>
                    <p className="text-xs text-gray-600">Ajustes del sistema</p>
                  </div>
                </div>
                <Button className="w-full text-sm" size="sm" onClick={() => setActiveTab('settings')}>
                  Configurar Sistema
                </Button>
              </div>
            </div>

            {/* System Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-black overflow-hidden">
              <div className="px-6 py-4 border-b border-black bg-gray-50">
                <h2 className="text-lg font-semibold text-black">Resumen del Sistema</h2>
                <p className="text-sm text-gray-600 mt-1">Estado actual de la plataforma</p>
              </div>
              <div className="p-6">
                {statsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-3"></div>
                    <p className="text-sm text-black">Cargando estadísticas...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-black mb-1">{userStats?.adminCount || 0}</p>
                      <p className="text-sm text-gray-600">Administradores</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-black mb-1">{userStats?.superadminCount || 0}</p>
                      <p className="text-sm text-gray-600">Superadmins</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-black mb-1">{userStats?.totalUsers || 0}</p>
                      <p className="text-sm text-gray-600">Usuarios Totales</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600 mb-1">100%</p>
                      <p className="text-sm text-gray-600">Tiempo Actividad</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navigation row */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="outline" size="sm" className="text-sm flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Inicio
                </Button>
              </Link>
              <Link to="/admin">
                <Button variant="outline" size="sm" className="text-sm">
                  Panel Admin
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-black">{user?.email}</p>
                <p className="text-xs text-gray-500">Superadministrador</p>
              </div>
              <Button variant="outline" onClick={handleSignOut} size="sm" className="text-sm flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
          
          {/* Title row */}
          <div className="py-6 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-black">Panel de Superadministrador</h1>
                <p className="text-gray-600 mt-1">Gestión completa del sistema y usuarios</p>
              </div>
              <span className="px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">
                SUPERADMIN
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      {activeTab !== 'overview' && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className="py-4 px-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
              >
                Resumen
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Usuarios
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-1 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-1 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === 'settings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Configuración
              </button>
            </nav>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default SuperAdmin;
