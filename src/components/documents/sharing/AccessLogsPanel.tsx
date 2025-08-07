import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DocumentAccessLog } from '@/types/DocumentPermissions';
import { Eye, Download, FileText, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AccessLogsPanelProps {
  accessLogs: DocumentAccessLog[];
}

const getAccessTypeIcon = (type: string) => {
  switch (type) {
    case 'download': return <Download className="h-4 w-4" />;
    case 'edit': return <FileText className="h-4 w-4" />;
    case 'print': return <FileText className="h-4 w-4" />;
    default: return <Eye className="h-4 w-4" />;
  }
};

const getAccessTypeColor = (type: string) => {
  switch (type) {
    case 'download': return 'bg-blue-100 text-blue-800';
    case 'edit': return 'bg-green-100 text-green-800';
    case 'print': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const AccessLogsPanel: React.FC<AccessLogsPanelProps> = ({ accessLogs }) => {
  const groupedLogs = accessLogs.reduce((acc, log) => {
    const date = new Date(log.accessed_at).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(log);
    return acc;
  }, {} as Record<string, DocumentAccessLog[]>);

  if (accessLogs.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">
            No hay registros de acceso disponibles
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(groupedLogs).map(([date, logs]) => (
        <Card key={date}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {format(new Date(date), 'EEEE, d MMMM yyyy', { locale: es })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getAccessTypeIcon(log.access_type)}
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className={getAccessTypeColor(log.access_type)}>
                          {log.access_type}
                        </Badge>
                        {log.user_id ? (
                          <span className="text-sm font-medium">Usuario autenticado</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Usuario anónimo</span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(log.accessed_at), 'HH:mm:ss', { locale: es })}
                        {log.session_duration && (
                          <>
                            {' • '}
                            <Clock className="h-3 w-3 inline mr-1" />
                            {Math.floor(log.session_duration / 60)}m {log.session_duration % 60}s
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {log.ip_address && (
                    <div className="text-sm text-muted-foreground">
                      {log.ip_address}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};