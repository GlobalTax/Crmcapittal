import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface EmailComposeProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailCompose: React.FC<EmailComposeProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Redactar Email</DialogTitle>
        </DialogHeader>
        <div className="flex-1 p-4">
          <p>Formulario de composición de email</p>
          <Button onClick={onClose} className="mt-4">Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};