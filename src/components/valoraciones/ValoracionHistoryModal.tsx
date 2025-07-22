
import React from 'react';
import { Valoracion, ValoracionPhaseHistory } from '@/types/Valoracion';
import { VALORACION_PHASES } from '@/utils/valoracionPhases';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ValoracionHistoryModalProps {
  valoracion: Valoracion | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ValoracionHistoryModal = ({ 
  valoracion, 
  isOpen, 
  onClose 
}: ValoracionHistoryModalProps) => {
  if (!valoracion) return null;

  // Mock history data - in real app, this would come from the API
  const mockHistory: ValoracionPhaseHistory[] = [
    {
      id: '1',
      valoracion_id: valoracion.id,
      phase: 'requested',
      changed_by: 'Juan Pérez',
      changed_at: valoracion.created_at,
      notes: 'Valoración solicitada por el cliente'
    },
    {
      id: '2',
      valoracion_id: valoracion.id,
      phase: 'in_process',
      changed_by: valoracion.assigned_to || 'Sistema',
      changed_at: new Date(Date.now() - 86400000).toISOString(),
      notes: 'Iniciado el proceso de análisis'
    }
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Historial de Fases - {valoracion.company_name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Status */}
          <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Estado Actual</h4>
                <Badge className={`${VALORACION_PHASES[valoracion.status].bgColor} ${VALORACION_PHASES[valoracion.status].textColor} border-0 mt-1`}>
                  {VALORACION_PHASES[valoracion.status].icon} {VALORACION_PHASES[valoracion.status].label}
                </Badge>
              </div>
              <span className="text-sm text-muted-foreground">
                {format(new Date(valoracion.updated_at), 'dd MMM yyyy HH:mm', { locale: es })}
              </span>
            </div>
          </div>
          
          {/* History Timeline */}
          <div className="space-y-4">
            <h4 className="font-medium text-lg">Historial de Cambios</h4>
            
            <div className="space-y-4">
              {mockHistory.map((entry, index) => {
                const phase = VALORACION_PHASES[entry.phase];
                const isFirst = index === 0;
                const isLast = index === mockHistory.length - 1;
                
                return (
                  <div key={entry.id} className="flex gap-4">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${phase.bgColor} ${phase.textColor}`}
                      >
                        {phase.icon}
                      </div>
                      {!isLast && (
                        <div className="w-0.5 h-12 bg-gray-200 mt-2" />
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 pb-8">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{phase.label}</span>
                          <Badge variant="outline" className="text-xs">
                            {phase.description}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(entry.changed_at), 'dd MMM yyyy HH:mm', { locale: es })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="w-5 h-5">
                          <AvatarFallback className="text-xs">
                            {getInitials(entry.changed_by)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">
                          por {entry.changed_by}
                        </span>
                      </div>
                      
                      {entry.notes && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {entry.notes}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
