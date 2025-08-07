import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDocumentShares } from '@/hooks/useDocumentShares';
import { CreateShareDialog } from './CreateShareDialog';
import { ShareLinkItem } from './ShareLinkItem';
import { AccessLogsPanel } from './AccessLogsPanel';
import { Share2, Eye, Download, Link, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ShareManagerProps {
  documentId: string;
}

export const ShareManager: React.FC<ShareManagerProps> = ({ documentId }) => {
  const { shares, accessLogs, loading } = useDocumentShares(documentId);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const totalViews = shares.reduce((sum, share) => sum + share.current_views, 0);
  const activeShares = shares.filter(share => share.is_active).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Enlaces Compartidos
              </CardTitle>
              <CardDescription>
                Crea y gestiona enlaces para compartir este documento
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Link className="h-4 w-4 mr-2" />
              Crear Enlace
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{activeShares}</div>
              <div className="text-sm text-muted-foreground">Enlaces Activos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalViews}</div>
              <div className="text-sm text-muted-foreground">Total Visualizaciones</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{accessLogs.length}</div>
              <div className="text-sm text-muted-foreground">Accesos Registrados</div>
            </div>
          </div>

          <Tabs defaultValue="links" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="links">Enlaces Compartidos</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="links" className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Cargando enlaces...
                </div>
              ) : shares.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay enlaces compartidos activos
                </div>
              ) : (
                <div className="space-y-3">
                  {shares.map((share) => (
                    <ShareLinkItem key={share.id} share={share} />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="analytics">
              <AccessLogsPanel accessLogs={accessLogs} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <CreateShareDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        documentId={documentId}
      />
    </div>
  );
};