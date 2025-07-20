
import { useState } from 'react';
import { ChevronDown, ChevronUp, Filter, Clock, User, Building2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lead } from '@/types/Lead';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface HistorySectionProps {
  lead: Lead;
}

export const HistorySection = ({ lead }: HistorySectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  // Mock history data
  const historyEntries = [
    {
      id: '1',
      type: 'created',
      title: 'Deal creado',
      description: `Deal "${lead.name}" fue creado`,
      date: lead.created_at,
      user: 'Sistema',
      icon: Tag
    },
    {
      id: '2',
      type: 'stage_change',
      title: 'Etapa cambiada',
      description: 'Movido a Pipeline',
      date: lead.updated_at,
      user: 'Usuario',
      icon: Building2
    }
  ];

  const filters = [
    { id: 'all', label: 'Todo', count: historyEntries.length },
    { id: 'activities', label: 'Actividades', count: 0 },
    { id: 'changes', label: 'Cambios', count: 2 },
    { id: 'emails', label: 'Emails', count: 0 }
  ];

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            HISTORIA
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 p-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        {isExpanded && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`
                    px-2 py-1 rounded text-xs font-medium transition-colors
                    ${activeFilter === filter.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }
                  `}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>

            {/* History Timeline */}
            <div className="space-y-3">
              {historyEntries.map((entry, index) => {
                const IconComponent = entry.icon;
                const isLast = index === historyEntries.length - 1;
                
                return (
                  <div key={entry.id} className="relative">
                    {/* Timeline line */}
                    {!isLast && (
                      <div className="absolute left-4 top-8 w-0.5 h-6 bg-border" />
                    )}
                    
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                        <IconComponent className="h-4 w-4 text-muted-foreground" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{entry.title}</div>
                        <div className="text-xs text-muted-foreground mb-1">
                          {entry.description}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {format(new Date(entry.date), 'dd MMM yyyy, HH:mm', { locale: es })}
                          </span>
                          <span>•</span>
                          <span>{entry.user}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
