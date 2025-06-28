
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { OperationsList } from '@/components/OperationsList';
import { AddOperationDialog } from '@/components/AddOperationDialog';
import { useOperations } from '@/hooks/useOperations';

const Deals = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { addOperation } = useOperations();

  const handleAddOperation = async (operationData: any) => {
    const result = await addOperation(operationData);
    if (result.error) {
      console.error('Error creating operation:', result.error);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Deals</h1>
            <p className="text-gray-600 mt-2">
              Administra todas las operaciones de M&A de tu cartera
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Crear Nuevo Deal
          </Button>
        </div>
      </div>
      
      <OperationsList />
      
      <AddOperationDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddOperation={handleAddOperation}
      />
    </div>
  );
};

export default Deals;
