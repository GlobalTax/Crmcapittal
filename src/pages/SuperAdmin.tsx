import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, LogOut, Users, Settings, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import UserManagement from "@/components/UserManagement";

const SuperAdmin = () => {
  const { signOut, user } = useAuth();
  const { role, loading } = useUserRole();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'analytics' | 'settings'>('overview');

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
          <div className="bg-white rounded-xl shadow-sm border border-black p-4">
            <h2 className="text-sm font-semibold text-black mb-3">Analytics Avanzados</h2>
            <p className="text-black text-xs">Funcionalidad de analytics en desarrollo...</p>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-black p-4">
            <h2 className="text-sm font-semibold text-black mb-3">Configuración Global</h2>
            <p className="text-black text-xs">Configuración del sistema en desarrollo...</p>
          </div>
        );
      default:
        return (
          <>
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-black">
                <div className="flex items-center">
                  <Users className="h-6 w-6 text-blue-600 mr-3" />
                  <div>
                    <h3 className="text-sm font-semibold text-black">Gestión de Usuarios</h3>
                    <p className="text-xs text-black">Administrar roles y permisos</p>
                  </div>
                </div>
                <Button className="w-full mt-3 text-xs" size="sm" onClick={() => setActiveTab('users')}>
                  Gestionar Usuarios
                </Button>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm border border-black">
                <div className="flex items-center">
                  <BarChart3 className="h-6 w-6 text-green-600 mr-3" />
                  <div>
                    <h3 className="text-sm font-semibold text-black">Analytics Avanzados</h3>
                    <p className="text-xs text-black">Reportes y métricas globales</p>
                  </div>
                </div>
                <Button className="w-full mt-3 text-xs" size="sm" onClick={() => setActiveTab('analytics')}>
                  Ver Analytics
                </Button>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm border border-black">
                <div className="flex items-center">
                  <Settings className="h-6 w-6 text-purple-600 mr-3" />
                  <div>
                    <h3 className="text-sm font-semibold text-black">Configuración Global</h3>
                    <p className="text-xs text-black">Ajustes del sistema</p>
                  </div>
                </div>
                <Button className="w-full mt-3 text-xs" size="sm" onClick={() => setActiveTab('settings')}>
                  Configurar Sistema
                </Button>
              </div>
            </div>

            {/* System Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-black overflow-hidden">
              <div className="px-4 py-3 border-b border-black">
                <h2 className="text-sm font-semibold text-black">Resumen del Sistema</h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-black">0</p>
                    <p className="text-xs text-black">Administradores</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-black">1</p>
                    <p className="text-xs text-black">Superadmins</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-black">0</p>
                    <p className="text-xs text-black">Usuarios Activos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-black">100%</p>
                    <p className="text-xs text-black">Tiempo Actividad</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-black shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/">
                <Button variant="outline" size="sm" className="text-xs">
                  <ArrowLeft className="h-3 w-3 mr-1" />
                  Volver al Portfolio
                </Button>
              </Link>
              <div className="flex items-center">
                <h1 className="text-lg font-bold text-black">Panel de Superadministrador</h1>
                <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                  SUPERADMIN
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <p className="text-xs text-black">Bienvenido, {user?.email}</p>
              </div>
              <Link to="/admin">
                <Button variant="outline" size="sm" className="text-xs">
                  Panel Admin
                </Button>
              </Link>
              <Button variant="outline" onClick={handleSignOut} size="sm" className="text-xs">
                <LogOut className="h-3 w-3 mr-1" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      {activeTab !== 'overview' && (
        <div className="bg-white border-b border-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-6">
              <button
                onClick={() => setActiveTab('overview')}
                className="py-3 px-1 border-b-2 border-transparent text-xs font-medium text-black hover:text-blue-600 hover:border-blue-300"
              >
                Resumen
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-3 px-1 border-b-2 text-xs font-medium ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-black hover:text-blue-600 hover:border-blue-300'
                }`}
              >
                Usuarios
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-3 px-1 border-b-2 text-xs font-medium ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-black hover:text-blue-600 hover:border-blue-300'
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-3 px-1 border-b-2 text-xs font-medium ${
                  activeTab === 'settings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-black hover:text-blue-600 hover:border-blue-300'
                }`}
              >
                Configuración
              </button>
            </nav>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 bg-white">
        {renderContent()}
      </div>
    </div>
  );
};

export default SuperAdmin;
