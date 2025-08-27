import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useDocumentShares } from '@/hooks/useDocumentShares';
import { DocumentShare } from '@/types/DocumentPermissions';
import { Copy, Eye, Download, Lock, Calendar, MoreHorizontal, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/productionLogger';

interface ShareLinkItemProps {
  share: DocumentShare;
}

const getShareTypeIcon = (type: string) => {
  switch (type) {
    case 'edit': return <Download className="h-4 w-4" />;
    case 'comment': return <Eye className="h-4 w-4" />;
    default: return <Eye className="h-4 w-4" />;
  }
};

const getShareTypeColor = (type: string) => {
  switch (type) {
    case 'edit': return 'bg-blue-100 text-blue-800';
    case 'comment': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-green-100 text-green-800';
  }
};

export const ShareLinkItem: React.FC<ShareLinkItemProps> = ({ share }) => {
  const { revokeShareLink, generateShareUrl } = useDocumentShares();
  const { toast } = useToast();
  const [copying, setCopying] = useState(false);

  const shareUrl = generateShareUrl(share.share_token);

  const handleCopyLink = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Enlace copiado",
        description: "El enlace se ha copiado al portapapeles",
      });
    } catch (error) {
      logger.error('Failed to copy share link', { error, shareUrl });
      toast({
        title: "Error",
        description: "No se pudo copiar el enlace",
        variant: "destructive",
      });
    } finally {
      setCopying(false);
    }
  };

  const handleRevokeLink = async () => {
    await revokeShareLink(share.id);
  };

  const isExpired = share.expires_at && new Date(share.expires_at) < new Date();
  const isMaxViewsReached = share.max_views && share.current_views >= share.max_views;

  return (
    <Card className={`${isExpired || isMaxViewsReached ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getShareTypeIcon(share.share_type)}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Badge className={getShareTypeColor(share.share_type)}>
                  {share.share_type}
                </Badge>
                {share.password_hash && (
                  <Badge variant="secondary">
                    <Lock className="h-3 w-3 mr-1" />
                    Protegido
                  </Badge>
                )}
                {share.watermark_enabled && (
                  <Badge variant="secondary">Marca de agua</Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {share.current_views} visualizaciones
                {share.max_views && ` de ${share.max_views}`}
                {share.expires_at && (
                  <>
                    {' • Expira '}
                    <Calendar className="h-3 w-3 inline mr-1" />
                    {new Date(share.expires_at).toLocaleDateString()}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              disabled={copying || isExpired || isMaxViewsReached}
            >
              <Copy className="h-4 w-4 mr-1" />
              {copying ? 'Copiando...' : 'Copiar'}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleRevokeLink}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Revocar enlace
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {(isExpired || isMaxViewsReached) && (
          <div className="mt-2 text-sm text-destructive">
            {isExpired && 'Este enlace ha expirado'}
            {isMaxViewsReached && 'Este enlace ha alcanzado el máximo de visualizaciones'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};