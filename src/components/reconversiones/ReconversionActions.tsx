import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pause, X, Play, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface ReconversionActionsProps {
  reconversion: any;
  onUpdate: (id: string, updates: any) => Promise<void>;
}

export function ReconversionActions({ reconversion, onUpdate }: ReconversionActionsProps) {
  const [isPauseDialogOpen, setIsPauseDialogOpen] = useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [pauseReason, setPauseReason] = useState('');
  const [closeReason, setCloseReason] = useState('');
  const [finalOutcome, setFinalOutcome] = useState('');

  const handlePause = async () => {
    if (!pauseReason.trim()) {
      toast.error('Por favor, especifica el motivo de la pausa');
      return;
    }

    try {
      await onUpdate(reconversion.id, {
        status: 'pausada',
        paused_at: new Date().toISOString(),
        paused_reason: pauseReason
      });
      
      toast.success('Reconversión pausada correctamente');
      setIsPauseDialogOpen(false);
      setPauseReason('');
    } catch (error) {
      toast.error('Error al pausar la reconversión');
    }
  };

  const handleResume = async () => {
    try {
      await onUpdate(reconversion.id, {
        status: 'en_progreso',
        paused_at: null,
        paused_reason: null
      });
      
      toast.success('Reconversión reanudada correctamente');
    } catch (error) {
      toast.error('Error al reanudar la reconversión');
    }
  };

  const handleClose = async () => {
    if (!closeReason.trim()) {
      toast.error('Por favor, especifica el motivo del cierre');
      return;
    }

    try {
      await onUpdate(reconversion.id, {
        status: 'cerrada',
        closed_at: new Date().toISOString(),
        closed_reason: closeReason,
        final_outcome: finalOutcome
      });
      
      toast.success('Reconversión cerrada correctamente');
      setIsCloseDialogOpen(false);
      setCloseReason('');
      setFinalOutcome('');
    } catch (error) {
      toast.error('Error al cerrar la reconversión');
    }
  };

  const canPause = reconversion.status === 'en_progreso';
  const canResume = reconversion.status === 'pausada';
  const canClose = ['en_progreso', 'pausada'].includes(reconversion.status);

  return (
    <div className="flex items-center gap-2">
      {canPause && (
        <Dialog open={isPauseDialogOpen} onOpenChange={setIsPauseDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Pause className="h-4 w-4 mr-2" />
              Pausar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pause className="h-5 w-5" />
                Pausar Reconversión
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">
                    Esta acción pausará la reconversión
                  </p>
                  <p className="text-sm text-yellow-700">
                    Se registrará en el historial y podrás reanudarla más tarde
                  </p>
                </div>
              </div>
              
              <div>
                <Label htmlFor="pauseReason">Motivo de la pausa *</Label>
                <Textarea
                  id="pauseReason"
                  placeholder="Especifica el motivo por el cual se pausa la reconversión..."
                  value={pauseReason}
                  onChange={(e) => setPauseReason(e.target.value)}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsPauseDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handlePause} disabled={!pauseReason.trim()}>
                  Pausar Reconversión
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {canResume && (
        <Button variant="outline" size="sm" onClick={handleResume}>
          <Play className="h-4 w-4 mr-2" />
          Reanudar
        </Button>
      )}

      {canClose && (
        <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <X className="h-4 w-4 mr-2" />
              Cerrar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <X className="h-5 w-5" />
                Cerrar Reconversión
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">
                    Esta acción cerrará definitivamente la reconversión
                  </p>
                  <p className="text-sm text-red-700">
                    Una vez cerrada, no se podrá reanudar
                  </p>
                </div>
              </div>
              
              <div>
                <Label htmlFor="closeReason">Motivo del cierre *</Label>
                <Textarea
                  id="closeReason"
                  placeholder="Especifica el motivo por el cual se cierra la reconversión..."
                  value={closeReason}
                  onChange={(e) => setCloseReason(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="finalOutcome">Resultado final</Label>
                <Select value={finalOutcome} onValueChange={setFinalOutcome}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el resultado final" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exitosa">Reconversión exitosa</SelectItem>
                    <SelectItem value="sin_exito">Sin éxito</SelectItem>
                    <SelectItem value="cancelada">Cancelada por el cliente</SelectItem>
                    <SelectItem value="recursos_insuficientes">Recursos insuficientes</SelectItem>
                    <SelectItem value="otras_prioridades">Otras prioridades</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCloseDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleClose} disabled={!closeReason.trim()}>
                  Cerrar Reconversión
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}