import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Plus, Upload, ArrowRight } from 'lucide-react';

interface EmptyLeadsStateProps {
  onCreateLead: () => void;
  onShowGuide: () => void;
}

export const EmptyLeadsState = ({ onCreateLead, onShowGuide }: EmptyLeadsStateProps) => {
  return (
    <Card className="border-dashed border-2 border-muted-foreground/25">
      <CardContent className="flex flex-col items-center justify-center p-12 text-center">
        <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-muted flex items-center justify-center">
          <Users className="h-12 w-12 text-muted-foreground" />
        </div>
        
        <h3 className="text-lg font-semibold mb-2">
          No tienes leads todavía
        </h3>
        
        <p className="text-muted-foreground mb-6 max-w-sm">
          Los leads son contactos potenciales que pueden convertirse en clientes. 
          Comienza agregando tu primer lead para iniciar tu pipeline de ventas.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Button onClick={onCreateLead} className="animate-pulse">
            <Plus className="h-4 w-4 mr-2" />
            Crear mi primer Lead
          </Button>
          
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Importar Leads
          </Button>
        </div>

        <Button variant="ghost" onClick={onShowGuide} className="text-sm">
          Ver guía rápida
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
};