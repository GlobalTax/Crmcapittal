
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { EmailStatsCard } from "@/components/dashboard/EmailStatsCard";
import { useOperations } from "@/hooks/useOperations";
import { useLeads } from "@/hooks/useLeads";
import { useUserRole } from "@/hooks/useUserRole";
import { 
  Activity, 
  Users, 
  Bell, 
  TrendingUp 
} from "lucide-react";

const UserDashboard = () => {
  const { operations, loading: operationsLoading } = useOperations();
  const { leads, isLoading: leadsLoading } = useLeads();
  const { role } = useUserRole();

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
  ];

  const stats = [
    {
      title: "Total Operaciones",
      value: operationsLoading ? "..." : operations.length,
      description: "Operaciones en el sistema",
      icon: Activity,
      trend: { value: 12, isPositive: true }
    },
    {
      title: "Operaciones Disponibles",
      value: operationsLoading ? "..." : operations.filter(op => op.status === 'available').length,
      description: "Listas para inversión",
      icon: TrendingUp,
      trend: { value: 8, isPositive: true }
    },
  ];

  // Add lead stats for admin and superadmin
  if (role === 'admin' || role === 'superadmin') {
    stats.push({
      title: "Total Leads",
      value: leadsLoading ? "..." : leads.length,
      description: "Leads en el sistema",
      icon: Bell,
      trend: { value: 23, isPositive: true }
    });

    stats.push({
      title: "Leads Nuevos",
      value: leadsLoading ? "..." : leads.filter(l => l.status === 'NEW').length,
      description: "Pendientes de contacto",
      icon: Users,
      trend: { value: 5, isPositive: true }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Bienvenido a tu panel de control. Aquí tienes un resumen de tu actividad.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Email Stats Section for admin users */}
      {(role === 'admin' || role === 'superadmin') && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Estadísticas de Email</h3>
          <EmailStatsCard />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <ActivityFeed activities={recentActivities} />
        
        <div className="col-span-4 space-y-4">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Acciones Rápidas</h3>
            <div className="grid gap-2">
              <a href="/portfolio" className="block p-3 rounded-md hover:bg-muted transition-colors">
                <div className="font-medium">Explorar Portfolio</div>
                <div className="text-sm text-muted-foreground">Descubre oportunidades de inversión</div>
              </a>
              {role === 'admin' || role === 'superadmin' ? (
                <>
                  <a href="/portfolio" className="block p-3 rounded-md hover:bg-muted transition-colors">
                    <div className="font-medium">Gestionar Operaciones</div>
                    <div className="text-sm text-muted-foreground">Administra el portfolio de operaciones</div>
                  </a>
                  <a href="/leads" className="block p-3 rounded-md hover:bg-muted transition-colors">
                    <div className="font-medium">Ver Leads</div>
                    <div className="text-sm text-muted-foreground">Gestiona los leads entrantes</div>
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

export default UserDashboard;
