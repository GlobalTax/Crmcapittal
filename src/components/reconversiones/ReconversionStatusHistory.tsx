import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clock, User } from 'lucide-react';
import { useReconversionRelations } from '@/hooks/useReconversionRelations';

import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReconversionStatusHistoryProps {
  reconversionId: string;
}

export const ReconversionStatusHistory = ({ reconversionId }: ReconversionStatusHistoryProps) => {
  const [history, setHistory] = useState<any[]>([]);
  const { loading, getStatusHistory } = useReconversionRelations();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getStatusHistory(reconversionId);
        setHistory(data);
      } catch (error) {
        console.error('Error fetching status history:', error);
      }
    };

    fetchHistory();
  }, [reconversionId, getStatusHistory]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'matching': return 'secondary';
      case 'paused': return 'outline';
      case 'closed': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 border-green-300';
      case 'matching': return 'bg-blue-100 border-blue-300';
      case 'paused': return 'bg-yellow-100 border-yellow-300';
      case 'closed': return 'bg-red-100 border-red-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Cargando historial...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Historial de Estados
        </CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            No hay cambios de estado registrados.
          </p>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border"></div>
            
            <div className="space-y-6">
              {history.map((item, index) => (
                <div key={item.id} className="relative flex items-start gap-4">
                  {/* Timeline dot */}
                  <div className={`
                    relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2
                    ${getStatusColor(item.new_status)}
                  `}>
                    <Badge 
                      variant={getStatusVariant(item.new_status)} 
                      className="h-6 w-6 p-0 text-xs"
                    >
                      {index + 1}
                    </Badge>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-8">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getStatusVariant(item.new_status)}>
                        {item.new_status}
                      </Badge>
                      {item.previous_status && (
                        <>
                          <span className="text-muted-foreground text-sm">desde</span>
                          <Badge variant="outline">
                            {item.previous_status}
                          </Badge>
                        </>
                      )}
                    </div>
                    
                    {item.change_reason && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.change_reason}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {format(new Date(item.created_at), 'dd MMM yyyy, HH:mm', { locale: es })}
                        </span>
                        <span className="ml-1">
                          ({formatDistanceToNow(new Date(item.created_at), { 
                            addSuffix: true, 
                            locale: es 
                          })})
                        </span>
                      </div>
                      
                      {item.metadata?.automated && (
                        <Badge variant="outline">
                          Automático
                        </Badge>
                      )}
                    </div>
                    
                    {item.metadata && Object.keys(item.metadata).length > 1 && (
                      <details className="mt-2">
                        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                          Ver detalles adicionales
                        </summary>
                        <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(item.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};