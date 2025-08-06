import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LostReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  leadName?: string;
}

const LOST_REASONS = [
  'Presupuesto insuficiente',
  'No es el momento adecuado',
  'Decidió trabajar con competencia',
  'No responde a comunicaciones',
  'Requisitos no alineados',
  'Proceso de decisión muy largo',
  'No es decision maker',
  'Proyecto cancelado',
  'Otro'
];

export const LostReasonModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  leadName 
}: LostReasonModalProps) => {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');

  const handleConfirm = () => {
    const reason = selectedReason === 'Otro' ? customReason : selectedReason;
    
    if (!reason.trim()) {
      return;
    }
    
    onConfirm(reason);
    handleClose();
  };

  const handleClose = () => {
    setSelectedReason('');
    setCustomReason('');
    onClose();
  };

  const isCustomReason = selectedReason === 'Otro';
  const finalReason = isCustomReason ? customReason : selectedReason;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Marcar lead como perdido
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {leadName && (
            <p className="text-sm text-muted-foreground">
              Lead: <span className="font-medium">{leadName}</span>
            </p>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo de pérdida *</Label>
            <Select value={selectedReason} onValueChange={setSelectedReason}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un motivo" />
              </SelectTrigger>
              <SelectContent>
                {LOST_REASONS.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {isCustomReason && (
            <div className="space-y-2">
              <Label htmlFor="custom-reason">Especifica el motivo</Label>
              <Textarea
                id="custom-reason"
                placeholder="Describe el motivo específico..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!finalReason.trim()}
            variant="destructive"
          >
            Marcar como perdido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};