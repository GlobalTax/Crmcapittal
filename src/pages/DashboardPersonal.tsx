import { useAuth } from '@/contexts/AuthContext';
import { KpiCards } from '@/components/personal/KpiCards';
import { PanelTareasToday } from '@/components/personal/PanelTareasToday';
import { PanelCalendario } from '@/components/personal/PanelCalendario';
import { PanelPipelineMini } from '@/components/personal/PanelPipelineMini';
import { TimelineActividad } from '@/components/personal/TimelineActividad';
import { QuickActions } from '@/components/personal/QuickActions';
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function DashboardPersonal() {
  const { user } = useAuth();

  return (
    <main className="max-w-7xl mx-auto px-8 py-6 grid gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            ¡Hola, {user?.user_metadata?.first_name || 'Usuario'}!
          </h1>
          <p className="text-muted-foreground">
            {format(new Date(), 'EEEE, d MMMM yyyy', { locale: es })}
          </p>
        </div>
      </div>

      {/* KPI Bar */}
      <KpiCards />

      {/* Main Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <PanelTareasToday className="col-span-1" />
        <PanelCalendario className="col-span-1" />
        <PanelPipelineMini className="col-span-1" />
      </div>

      {/* Bottom Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <TimelineActividad className="col-span-1" />
        <QuickActions className="col-span-1" />
      </div>

      {/* Optional Charts */}
      <details className="mt-6">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
          Mostrar gráficos avanzados
        </summary>
        <div className="mt-4 grid md:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <h3 className="section-title">Ingresos últimos 6 meses</h3>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Gráfico de área próximamente
            </div>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <h3 className="section-title">Distribución por etapa</h3>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Gráfico circular próximamente
            </div>
          </div>
        </div>
      </details>
    </main>
  );
}