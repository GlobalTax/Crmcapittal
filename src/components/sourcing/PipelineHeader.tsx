
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreateDealDialog } from "@/components/deals/CreateDealDialog";
import { PipelineType } from "@/types/Pipeline";
import { Table } from "lucide-react";
import { useDeals } from "@/hooks/useDeals";
import { toast } from "sonner";

interface PipelineHeaderProps {
  pipelineType: PipelineType;
  pipelineId?: string;
  onToggleView: () => void;
}

export const PipelineHeader = ({ pipelineType, pipelineId, onToggleView }: PipelineHeaderProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { createDeal } = useDeals();

  const handleCreateDeal = async (newDeal: any) => {
    try {
      await createDeal(newDeal);
      toast.success('Deal creado correctamente');
    } catch (error) {
      toast.error('Error al crear el deal');
    }
  };

  const getTitle = () => {
    switch (pipelineType) {
      case 'DEAL': return 'Pipeline de Deals M&A';
      case 'TARGET_COMPANY': return 'Pipeline de Empresas Objetivo';
      case 'LEAD': return 'Pipeline de Leads';
      case 'OPERACION': return 'Pipeline de Operaciones';
      case 'PROYECTO': return 'Pipeline de Proyectos';
      default: return 'Pipeline';
    }
  };

  return (
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold">{getTitle()}</h3>
      <div className="flex gap-2">
        {pipelineType === 'DEAL' && (
          <Button onClick={() => setShowCreateDialog(true)}>
            Crear Deal
          </Button>
        )}
        <Button
          onClick={onToggleView}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Table className="h-4 w-4" />
          Vista Tabla
        </Button>
      </div>

      <CreateDealDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleCreateDeal}
        pipelineId={pipelineType}
      />
    </div>
  );
};
