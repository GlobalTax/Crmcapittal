import { Button } from "@/components/ui/minimal/Button";
import { Badge } from "@/components/ui/minimal/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/minimal/Table";
import { useLeads } from "@/hooks/useLeads";
import { User, Mail, Briefcase } from "lucide-react";

export default function MinimalDashboard() {
  const { leads, isLoading } = useLeads({});

  const stats = [
    { label: "Leads nuevos", value: leads.filter(l => l.status === 'NEW').length },
    { label: "Negocios activos", value: leads.filter(l => l.status === 'QUALIFIED').length },
    { label: "Tareas del día", value: 5 }
  ];

  const recentActivity = [
    { id: 1, type: "lead", message: "Lead creado", time: "04/07/2025, 19:00" },
    { id: 2, type: "deal", message: "Negocio movido a 'Propuesta'", time: "04/07/2025, 18:30" },
    { id: 3, type: "task", message: "Tarea completada", time: "04/07/2025, 17:45" }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-6">Resumen</h1>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg p-6 border">
            <span className="text-gray-500 text-sm">{stat.label}</span>
            <span className="text-3xl font-bold mt-2 block">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg p-6 border">
        <h2 className="font-semibold mb-4">Actividad reciente</h2>
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center gap-3 py-2 border-b last:border-b-0">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <div className="flex-1">
                <span className="text-sm">{activity.message}</span>
                <span className="text-xs text-gray-500 ml-2">— {activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg p-6 border">
        <h2 className="font-semibold mb-4">Acciones rápidas</h2>
        <div className="flex gap-3 flex-wrap">
          <Button variant="primary">Crear Lead</Button>
          <Button variant="secondary">Nuevo Negocio</Button>
          <Button variant="secondary">Ver Contactos</Button>
        </div>
      </div>
    </div>
  );
}