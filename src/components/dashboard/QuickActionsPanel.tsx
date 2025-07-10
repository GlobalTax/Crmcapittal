import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { Button } from '@/components/ui/minimal/Button';
import { User, RefreshCw, Phone, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export const QuickActionsPanel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleNewLead = () => {
    navigate('/leads');
    toast({
      title: "Navegando a Leads",
      description: "Crea un nuevo lead desde la página de Leads",
    });
  };

  const handleConvertToTransaction = () => {
    navigate('/transacciones');
    toast({
      title: "Navegando a Transacciones", 
      description: "Convierte leads a transacciones desde el pipeline",
    });
  };

  const handleRegisterCall = () => {
    navigate('/contactos');
    toast({
      title: "Registrar Llamada",
      description: "Registra actividades desde la página de contactos",
    });
  };

  const handleNewMeeting = () => {
    navigate('/calendar');
    toast({
      title: "Nueva Reunión",
      description: "Programa reuniones desde tu calendario",
    });
  };

  return (
    <DashboardCard title="Acciones Rápidas">
      <div className="grid grid-cols-2 gap-3">
        <Button 
          variant="ghost" 
          className="h-auto p-4 flex flex-col items-center text-center"
          onClick={handleNewLead}
        >
          <User className="h-6 w-6 mb-2" />
          <span className="font-medium text-sm">Nuevo Lead</span>
          <span className="text-xs text-muted-foreground mt-1">
            Crear prospecto
          </span>
        </Button>
        
        <Button 
          variant="ghost" 
          className="h-auto p-4 flex flex-col items-center text-center"
          onClick={handleConvertToTransaction}
        >
          <RefreshCw className="h-6 w-6 mb-2" />
          <span className="font-medium text-sm">Convertir a Transacción</span>
          <span className="text-xs text-muted-foreground mt-1">
            Lead → Transacción
          </span>
        </Button>
        
        <Button 
          variant="ghost" 
          className="h-auto p-4 flex flex-col items-center text-center"
          onClick={handleRegisterCall}
        >
          <Phone className="h-6 w-6 mb-2" />
          <span className="font-medium text-sm">Registrar Llamada</span>
          <span className="text-xs text-muted-foreground mt-1">
            Anotar actividad
          </span>
        </Button>
        
        <Button 
          variant="ghost" 
          className="h-auto p-4 flex flex-col items-center text-center"
          onClick={handleNewMeeting}
        >
          <Plus className="h-6 w-6 mb-2" />
          <span className="font-medium text-sm">Nueva Reunión</span>
          <span className="text-xs text-muted-foreground mt-1">
            Programar cita
          </span>
        </Button>
      </div>
    </DashboardCard>
  );
};