import React, { useMemo, useState } from 'react';
import { useLeadUnifiedTasks } from '@/hooks/leads/useLeadUnifiedTasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, AlarmClock, ListTodo } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props { leadId: string; }

type Filter = 'pending' | 'completed' | 'all';

export const LeadUnifiedTasksTab: React.FC<Props> = ({ leadId }) => {
  const { tasks, pending, completed, counts, actions, isLoading } = useLeadUnifiedTasks(leadId);
  const [filter, setFilter] = useState<Filter>('pending');
  const [q, setQ] = useState('');

  const list = useMemo(() => {
    const base = filter === 'pending' ? pending : filter === 'completed' ? completed : tasks;
    const ql = q.trim().toLowerCase();
    return base
      .filter(t => !ql || t.title.toLowerCase().includes(ql))
      .sort((a, b) => {
        const ad = a.due_date ? new Date(a.due_date).getTime() : Infinity;
        const bd = b.due_date ? new Date(b.due_date).getTime() : Infinity;
        return ad - bd;
      });
  }, [tasks, pending, completed, filter, q]);

  return (
    <Card className="h-full min-h-0 flex flex-col">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-primary" />
            Tareas del Lead
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Total: {counts.total}</Badge>
            <Badge variant="secondary">Pendientes: {counts.pending}</Badge>
            <Badge variant="outline">Completadas: {counts.completed}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-md border p-1">
            <Button size="sm" variant={filter==='pending'?'default':'ghost'} onClick={()=>setFilter('pending')}>Pendientes</Button>
            <Button size="sm" variant={filter==='completed'?'default':'ghost'} onClick={()=>setFilter('completed')}>Completadas</Button>
            <Button size="sm" variant={filter==='all'?'default':'ghost'} onClick={()=>setFilter('all')}>Todas</Button>
          </div>
          <Input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar…" className="max-w-[240px]" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-[60vh] pr-2">
          {isLoading ? (
            <div className="text-muted-foreground">Cargando…</div>
          ) : list.length === 0 ? (
            <div className="text-muted-foreground">No hay tareas</div>
          ) : (
            <ul className="space-y-3">
              {list.map(t => (
                <li key={`${t.source}-${t.id}`} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{t.title}</span>
                      <Badge variant={t.source==='engine'?'secondary':'outline'}>
                        {t.source==='engine'?'Automática':'Manual'}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {t.due_date ? `Vence: ${format(new Date(t.due_date), 'dd MMM yy, HH:mm', { locale: es })}` : 'Sin fecha'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => actions.snoozeUnifiedTask(t, 1)} title="Posponer 1 día">
                      <AlarmClock className="h-4 w-4 mr-2" /> Posponer
                    </Button>
                    <Button size="sm" variant="default" onClick={() => actions.completeUnifiedTask(t)} title="Completar">
                      <CheckCircle2 className="h-4 w-4 mr-2" /> Completar
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
