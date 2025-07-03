
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CreateNegocioDialog } from '@/components/negocios/CreateNegocioDialog';
import { useNegocios } from '@/hooks/useNegocios';

interface PipelineHeaderProps {
  title: string;
  description?: string;
  pipelineId: string;
}

export const PipelineHeader: React.FC<PipelineHeaderProps> = ({ title, description, pipelineId }) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { createNegocio } = useNegocios();

  const handleCreateNegocio = async (negocioData: any) => {
    try {
      await createNegocio(negocioData);
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Error creating negocio:', error);
    }
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && (
          <p className="text-gray-600 mt-1">{description}</p>
        )}
      </div>
      <Button onClick={() => setShowCreateDialog(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Nuevo Negocio
      </Button>

      <CreateNegocioDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleCreateNegocio}
      />
    </div>
  );
};
