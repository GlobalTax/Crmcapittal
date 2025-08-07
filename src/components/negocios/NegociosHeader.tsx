
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface NegociosHeaderProps {
  showMetrics: boolean;
  setShowMetrics: (show: boolean) => void;
  setShowCreateDialog: (show: boolean) => void;
}

export const NegociosHeader = ({ 
  showMetrics, 
  setShowMetrics, 
  setShowCreateDialog 
}: NegociosHeaderProps) => {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h1 className="text-2xl font-semibold text-gray-900">Negocios</h1>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowMetrics(!showMetrics)}
        >
          {showMetrics ? 'Ocultar' : 'Mostrar'} Métricas
        </Button>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Negocio
        </Button>
      </div>
    </div>
  );
};
