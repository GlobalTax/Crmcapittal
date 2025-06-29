
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { EmailStatsCard } from "@/components/dashboard/EmailStatsCard";
import { useOperations } from "@/hooks/useOperations";
import { useLeads } from "@/hooks/useLeads";
import { 
  Activity, 
  Users, 
  Bell, 
  TrendingUp 
} from "lucide-react";

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { operations, loading: operationsLoading } = useOperations();
  const { leads, isLoading: leadsLoading } = useLeads();
  const { role } = useUserRole();

  // Show loading state while auth is being determined
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Mock recent activities with more realistic M&A data
  const recentActivities = [
    {
      id: '1',
      type: 'operation' as const,
      description: 'Nueva operación de fusión valorada en €2.5M añadida al portfolio',
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 min ago
      user: 'Ana García',
      priority: 'high' as const
    },
    {
      id: '2',
      type: 'lead' as const,
      description: 'Lead cualificado: Empresa tecnológica busca adquisición',
      timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 min ago
      user: 'Carlos Ruiz',
      priority: 'medium' as const
    },
    {
      id: '3',
      type: 'operation' as const,
      description: 'Operación de venta parcial cerrada exitosamente - €1.8M',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      user: 'María López',
      priority: 'high' as const
    },
    {
      id: '4',
      type: 'user' as const,
      description: 'Reunión programada con cliente potencial para mañana',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
      user: 'Sistema',
      priority: 'low' as const
    },
  ];

  const stats = [
    {
      title: "Total Operaciones",
      value: operationsLoading ? "..." : operations.length,
      description: "Operaciones en el sistema",
      icon: Activity,
      trend: { value: 12, isPositive: true },
      bgColor: "bg-gradient-to-br from-blue-500 to-blue-600",
      textColor: "text-white"
    },
    {
      title: "Operaciones Disponibles",
      value: operationsLoading ? "..." : operations.filter(op => op.status === 'available').length,
      description: "Listas para inversión",
      icon: TrendingUp,
      trend: { value: 8, isPositive: true },
      bgColor: "bg-gradient-to-br from-green-500 to-green-600",
      textColor: "text-white"
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
      bgColor: "bg-gradient-to-br from-purple-500 to-purple-600",
      textColor: "text-white"
    });

    stats.push({
      title: "Leads Nuevos",
      value: leadsLoading ? "..." : leads.filter(l => l.status === 'NEW').length,
      description: "Pendientes de contacto",
      icon: Users,
      trend: { value: 5, isPositive: true },
      bgColor: "bg-gradient-to-br from-orange-500 to-orange-600",
      textColor: "text-white"
    });
  }

  return (
    <div className="space-y-8">
      <div className="text-center lg:text-left">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-2">
          Bienvenido a tu panel de control. Aquí tienes un resumen de tu actividad.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Email Stats Section for admin users */}
      {(role === 'admin' || role === 'superadmin') && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">Estadísticas de Email</h3>
          <EmailStatsCard />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <ActivityFeed activities={recentActivities} />
        </div>
        
        <div className="lg:col-span-7">
          <div className="rounded-lg border bg-white shadow-sm p-6">
            <h3 className="text-xl font-semibold mb-6 text-gray-900">Acciones Rápidas</h3>
            <div className="grid gap-4">
              <a href="/portfolio" className="block p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                <div className="font-medium text-gray-900">Explorar Portfolio</div>
                <div className="text-sm text-gray-600 mt-1">Descubre oportunidades de inversión</div>
              </a>
              {role === 'admin' || role === 'superadmin' ? (
                <>
                  <a href="/operaciones" className="block p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                    <div className="font-medium text-gray-900">Gestionar Operaciones</div>
                    <div className="text-sm text-gray-600 mt-1">Administra el pipeline de operaciones</div>
                  </a>
                  <a href="/leads" className="block p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                    <div className="font-medium text-gray-900">Ver Leads</div>
                    <div className="text-sm text-gray-600 mt-1">Gestiona los leads entrantes</div>
                  </a>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
