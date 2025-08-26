import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onImport: () => void;
}

export function EmptyState({ onImport }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="py-8 text-center">
        <h3 className="text-lg font-semibold mb-2">No hay datos de HubSpot</h3>
        <p className="text-muted-foreground mb-4">
          No se han encontrado datos importados desde HubSpot.
        </p>
        <Button onClick={onImport} variant="default">
          Utiliza la herramienta de importación para traer datos desde HubSpot.
        </Button>
      </CardContent>
    </Card>
  );
}