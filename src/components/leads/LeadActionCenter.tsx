import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, Snooze } from 'lucide-react';
import { useLeadUnifiedTasks } from '@/hooks/leads/useLeadUnifiedTasks';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  leadId: string;
  onOpenAll?: () => void;
}

export const LeadActionCenter: React.FC<Props> = ({ leadId, onOpenAll }) => {
  const { pendingSorted, counts, actions, isLoading } = useLeadUnifiedTasks(leadId);
  const top = pendingSorted.slice(0, 5);

  return (
    <Card className="hover-lift transition-all duration-300">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Siguientes acciones
        </CardTitle>
        <Badge variant="outline">Pendientes: {counts.pending}</Badge>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-muted-foreground">Cargando…</div>
        ) : top.length === 0 ? (
          <div className="text-muted-foreground">Sin tareas pendientes</div>
        ) : (
          <ul className="space-y-3">
            {top.map(t => (
              <li key={`${t.source}-${t.id}`} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{t.title}</span>
                    <Badge variant="secondary">{t.source === 'engine' ? 'Automática' : 'Manual'}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {t.due_date ? `Vence: ${format(new Date(t.due_date), 'dd MMM yy, HH:mm', { locale: es })}` : 'Sin fecha'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="ghost" onClick={() => actions.snoozeUnifiedTask(t, 1)} title="Posponer 1 día">
                    <Snooze className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="default" onClick={() => actions.completeUnifiedTask(t)} title="Completar">
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex justify-end">
          <Button size="sm" variant="outline" onClick={onOpenAll}>Ver todas</Button>
        </div>
      </CardContent>
    </Card>
  );
};
