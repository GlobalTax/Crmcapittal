
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { EmailStatsCard } from "@/components/dashboard/EmailStatsCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { useOperations } from "@/hooks/useOperations";
import { useLeads } from "@/hooks/useLeads";
import { 
  Activity, 
  Users, 
  Bell, 
  TrendingUp,
  Target,
  Building2
} from "lucide-react";

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { operations, loading: operationsLoading } = useOperations();
  const { leads, isLoading: leadsLoading } = useLeads();
  const { role } = useUserRole();

  // Show loading state while auth is being determined
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  // Mock activity data
  const recentActivities = [
    {
      id: '1',
      type: 'operation' as const,
      description: 'Nueva operación añadida al portfolio',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
      user: 'Sistema'
    },
    {
      id: '2',
      type: 'lead' as const,
      description: 'Nuevo lead recibido desde el formulario web',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      user: 'Sistema'
    },
    {
      id: '3',
      type: 'operation' as const,
      description: 'Operación actualizada en el sistema',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      user: 'Sistema'
    },
  ];

  const stats = [
    {
      title: "Total Operaciones",
      value: operationsLoading ? "..." : operations.length,
      description: "Operaciones en el sistema",
      icon: Building2,
      trend: { value: 12, isPositive: true },
      color: "bg-blue-500"
    },
    {
      title: "Operaciones Disponibles",
      value: operationsLoading ? "..." : operations.filter(op => op.status === 'available').length,
      description: "Listas para inversión",
      icon: TrendingUp,
      trend: { value: 8, isPositive: true },
      color: "bg-green-500"
    },
  ];

  // Add lead stats for admin and superadmin
  if (role === 'admin' || role === 'superadmin') {
    stats.push({
      title: "Total Leads",
      value: leadsLoading ? "..." : leads.length,
      description: "Leads en el sistema",
      icon: Bell,
      trend: { value: 23, isPositive: true },
      color: "bg-orange-500"
    });

    stats.push({
      title: "Empresas Objetivo",
      value: "47",
      description: "En pipeline de sourcing",
      icon: Target,
      trend: { value: 15, isPositive: true },
      color: "bg-purple-500"
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Bienvenido de vuelta, {user?.email?.split('@')[0]}
              </h1>
              <p className="text-gray-600 mt-2">
                Aquí tienes un resumen de tu actividad y métricas clave.
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Último acceso</p>
                <p className="text-sm font-medium text-gray-900">Hace 2 horas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Activity Feed */}
          <div className="lg:col-span-2">
            <ActivityFeed activities={recentActivities} />
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <QuickActions role={role} />
          </div>
        </div>

        {/* Email Stats Section for admin users */}
        {(role === 'admin' || role === 'superadmin') && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Estadísticas de Email</h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Ver todo
              </button>
            </div>
            <EmailStatsCard />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
