import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { Button } from '@/components/ui/minimal/Button';
import { User, Briefcase, Calendar, DollarSign } from 'lucide-react';

export const PersonalQuickActionsPanel = () => {
  return (
    <DashboardCard title="Acciones Rápidas">
      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" className="h-auto p-4 flex flex-col items-center text-center">
          <User className="h-6 w-6 mb-2" />
          <span className="font-medium text-sm">Nuevo Lead</span>
          <span className="text-xs text-muted-foreground mt-1">
            Agregar prospecto
          </span>
        </Button>
        
        <Button variant="secondary" className="h-auto p-4 flex flex-col items-center text-center">
          <Briefcase className="h-6 w-6 mb-2" />
          <span className="font-medium text-sm">Nueva Empresa</span>
          <span className="text-xs text-muted-foreground mt-1">
            Registrar empresa
          </span>
        </Button>
        
        <Button variant="secondary" className="h-auto p-4 flex flex-col items-center text-center">
          <Calendar className="h-6 w-6 mb-2" />
          <span className="font-medium text-sm">Programar Llamada</span>
          <span className="text-xs text-muted-foreground mt-1">
            Agendar reunión
          </span>
        </Button>
        
        <Button variant="secondary" className="h-auto p-4 flex flex-col items-center text-center">
          <DollarSign className="h-6 w-6 mb-2" />
          <span className="font-medium text-sm">Nuevo Negocio</span>
          <span className="text-xs text-muted-foreground mt-1">
            Crear oportunidad
          </span>
        </Button>
      </div>
    </DashboardCard>
  );
};