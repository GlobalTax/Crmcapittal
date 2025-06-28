
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Wand2, Plus } from 'lucide-react';
import { AddContactDialog } from './AddContactDialog';
import { AdvancedContactWizard } from './wizard/AdvancedContactWizard';

interface EnhancedAddContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EnhancedAddContactDialog = ({ open, onOpenChange }: EnhancedAddContactDialogProps) => {
  const [showBasicForm, setShowBasicForm] = useState(false);
  const [showAdvancedWizard, setShowAdvancedWizard] = useState(false);

  const handleBasicFormClose = (open: boolean) => {
    setShowBasicForm(open);
    if (!open) {
      onOpenChange(false);
    }
  };

  const handleAdvancedWizardClose = (open: boolean) => {
    setShowAdvancedWizard(open);
    if (!open) {
      onOpenChange(false);
    }
  };

  return (
    <>
      <Dialog open={open && !showBasicForm && !showAdvancedWizard} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>¿Cómo quieres añadir el contacto?</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="text-sm text-gray-600 mb-6">
              Elige el método que mejor se adapte a tus necesidades
            </div>

            <Button
              onClick={() => setShowAdvancedWizard(true)}
              className="w-full h-auto p-6 flex flex-col items-start space-y-2"
              variant="outline"
            >
              <div className="flex items-center space-x-2">
                <Wand2 className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Asistente Avanzado (Recomendado)</span>
              </div>
              <p className="text-sm text-gray-600 text-left">
                Formulario completo paso a paso con todos los campos M&A, 
                incluyendo preferencias de inversión, sectores y configuraciones avanzadas.
              </p>
            </Button>

            <Button
              onClick={() => setShowBasicForm(true)}
              className="w-full h-auto p-6 flex flex-col items-start space-y-2"
              variant="outline"
            >
              <div className="flex items-center space-x-2">
                <Plus className="h-5 w-5 text-gray-600" />
                <span className="font-medium">Formulario Básico</span>
              </div>
              <p className="text-sm text-gray-600 text-left">
                Formulario simple y rápido con los campos esenciales. 
                Ideal para añadir contactos rápidamente.
              </p>
            </Button>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AddContactDialog 
        open={showBasicForm}
        onOpenChange={handleBasicFormClose}
      />
      
      <AdvancedContactWizard
        open={showAdvancedWizard}
        onOpenChange={handleAdvancedWizardClose}
      />
    </>
  );
};
