import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/minimal/Button';
import { Calendar, Plus } from 'lucide-react';

export const PersonalCalendarPanel = () => {
  const handleNewMeeting = () => {
    // TODO: Implement meeting creation
    console.log('Creating new meeting...');
  };

  return (
    <DashboardCard title="Próximos Eventos" icon={Calendar}>
      <div className="space-y-3">
        <Button 
          variant="secondary" 
          className="w-full"
          onClick={handleNewMeeting}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Reunión
        </Button>
        
        <EmptyState
          icon={Calendar}
          title="No hay eventos próximos"
          subtitle="Tu calendario está libre"
        />
      </div>
    </DashboardCard>
  );
};