import { AssignmentDashboard } from '@/components/leads/assignment/AssignmentDashboard';
import { PageTitle, Text } from '@/components/ui/typography';

export default function AssignmentControl() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <PageTitle>Control de Asignaciones de Leads</PageTitle>
        <Text variant="large" color="muted">
          Gestiona la distribución de leads entre tu equipo de trabajo
        </Text>
      </div>
      
      <AssignmentDashboard />
    </div>
  );
}