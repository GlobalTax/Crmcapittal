import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Clock, User, TrendingUp } from 'lucide-react';

// Mock data
const leadsActivities = [
  {
    id: '1',
    title: 'Llamada con TechStart Solutions',
    description: 'Revisión de propuesta inicial',
    time: 'Hace 2 horas',
    type: 'call'
  },
  {
    id: '2',
    title: 'Email enviado a Inversiones Mediterráneo',
    description: 'Documentación adicional solicitada',
    time: 'Hace 4 horas',
    type: 'email'
  },
  {
    id: '3',
    title: 'Reunión con Global Ventures Ltd',
    description: 'Presentación de términos finales',
    time: 'Hace 1 día',
    type: 'meeting'
  }
];

const txActivities = [
  {
    id: '1',
    title: 'Due Diligence completado - MetalTech',
    description: 'Revisión financiera finalizada',
    time: 'Hace 1 hora',
    type: 'document'
  },
  {
    id: '2',
    title: 'Valoración actualizada - Logística SA',
    description: 'Nuevo informe de valoración',
    time: 'Hace 3 horas',
    type: 'valuation'
  },
  {
    id: '3',
    title: 'Negociación avanzada - Fusión Construcción',
    description: 'Términos acordados preliminarmente',
    time: 'Hace 2 días',
    type: 'negotiation'
  }
];

export const ActivityTimeline = () => {
  return (
    <DashboardCard title="Timeline de Actividades" icon={Activity}>
      <Tabs defaultValue="leads" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="leads" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Actividades Leads
          </TabsTrigger>
          <TabsTrigger value="tx" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Actividades Transacciones
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="leads" className="space-y-4 mt-4">
          {leadsActivities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {activity.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activity.description}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  <Clock className="h-3 w-3 inline mr-1" />
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </TabsContent>
        
        <TabsContent value="tx" className="space-y-4 mt-4">
          {txActivities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {activity.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activity.description}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  <Clock className="h-3 w-3 inline mr-1" />
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </DashboardCard>
  );
};