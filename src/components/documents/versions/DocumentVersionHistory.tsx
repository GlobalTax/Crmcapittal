import React from 'react';
import { Clock, RotateCcw, Eye, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDocumentVersions } from '@/hooks/useDocumentVersions';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DocumentVersionHistoryProps {
  documentId: string;
  onRestoreVersion?: (versionId: string) => void;
  onPreviewVersion?: (versionId: string) => void;
}

export const DocumentVersionHistory: React.FC<DocumentVersionHistoryProps> = ({
  documentId,
  onRestoreVersion,
  onPreviewVersion,
}) => {
  const { versions, loading, restoreVersion } = useDocumentVersions(documentId);

  const handleRestore = async (versionId: string) => {
    if (window.confirm('¿Estás seguro de que quieres restaurar esta versión? Se perderá la versión actual.')) {
      const success = await restoreVersion(versionId, documentId);
      if (success && onRestoreVersion) {
        onRestoreVersion(versionId);
      }
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Historial de Versiones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Historial de Versiones
          <Badge variant="secondary">{versions.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {versions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No hay versiones anteriores</p>
            <p className="text-sm">Las versiones se crean automáticamente al guardar cambios</p>
          </div>
        ) : (
          <div className="space-y-3">
            {versions.map((version, index) => (
              <div
                key={version.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={index === 0 ? "default" : "outline"}>
                      v{version.version_number}
                    </Badge>
                    {index === 0 && (
                      <Badge variant="secondary" className="text-xs">
                        Actual
                      </Badge>
                    )}
                  </div>
                  
                  <h4 className="font-medium text-sm line-clamp-1">
                    {version.title}
                  </h4>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(version.created_at), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
                    </span>
                    {version.changes_summary && (
                      <span className="flex-1 truncate">
                        {version.changes_summary}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 ml-4">
                  {onPreviewVersion && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPreviewVersion(version.id)}
                      className="h-8 px-2"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  )}
                  
                  {index > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRestore(version.id)}
                      className="h-8 px-2"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};