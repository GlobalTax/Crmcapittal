import React from 'react';
import { useLeadTaskEngine } from '@/hooks/leads/useLeadTaskEngine';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, Clock3, Phone, Video, FileText, MessageSquare, ListChecks } from 'lucide-react';
import { format } from 'date-fns';

interface LeadTaskEngineListProps {
  leadId: string;
}

const typeIcon: Record<string, React.ReactNode> = {
  llamada: <Phone className="h-4 w-4" />,
  videollamada: <Video className="h-4 w-4" />,
  informe_mercado: <FileText className="h-4 w-4" />,
  whatsapp: <MessageSquare className="h-4 w-4" />,
  preguntas_reunion: <ListChecks className="h-4 w-4" />,
};

export const LeadTaskEngineList: React.FC<LeadTaskEngineListProps> = ({ leadId }) => {
  const { tasks, isLoading, createTask, completeTask, snoozeTask } = useLeadTaskEngine(leadId);

  const createQuick = (type: any, title?: string) =>
    createTask({ lead_id: leadId, type, title });

  if (isLoading) {
    return <div className="text-muted-foreground">Cargando tareas...</div>;
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-base font-semibold">Tareas (Motor IA)</h4>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => createQuick('llamada', 'Llamada inicial')}>
            <Phone className="mr-2 h-4 w-4" /> Llamada inicial
          </Button>
          <Button size="sm" variant="secondary" onClick={() => createQuick('preguntas_reunion')}>
            <ListChecks className="mr-2 h-4 w-4" /> Preparar preguntas
          </Button>
          <Button size="sm" variant="secondary" onClick={() => createQuick('videollamada')}>
            <Video className="mr-2 h-4 w-4" /> Agendar video
          </Button>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="text-sm text-muted-foreground">Sin tareas aún. Usa los accesos rápidos.</div>
      ) : (
        <ul className="divide-y divide-border rounded-md border">
          {tasks.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-3 p-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={t.status === 'done'}
                  onCheckedChange={(v) => v && completeTask(t.id)}
                  aria-label="Marcar completada"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-sm font-medium">
                      {typeIcon[t.type] || <CheckCircle2 className="h-4 w-4" />} {t.title}
                    </span>
                    {t.can_start === false && (
                      <Badge variant="destructive">Bloqueada</Badge>
                    )}
                    {t.status !== 'done' && t.priority && (
                      <Badge variant="outline" className="capitalize">{t.priority}</Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {t.due_date && (
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="h-3 w-3" /> {format(new Date(t.due_date), 'dd/MM/yyyy HH:mm')}
                      </span>
                    )}
                  </div>
                  {t.dependencies?.length ? (
                    <div className="mt-1 text-xs text-muted-foreground">
                      Depende de: {t.dependencies.join(', ')}
                    </div>
                  ) : null}
                </div>
              </div>

              {t.status !== 'done' && (
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => snoozeTask({ id: t.id, days: 2 })}>
                    Posponer 2d
                  </Button>
                  <Button size="sm" onClick={() => completeTask(t.id)}>Completar</Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
