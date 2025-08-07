import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share2, Mail, Eye } from 'lucide-react';
import { useProposalAnalytics } from '@/hooks/useProposalAnalytics';
import { toast } from 'sonner';

interface TrackedActionsProps {
  proposalId: string;
  onDownload?: () => void;
  onShare?: () => void;
  onEmail?: () => void;
  onPreview?: () => void;
}

export const TrackedActions: React.FC<TrackedActionsProps> = ({
  proposalId,
  onDownload,
  onShare,
  onEmail,
  onPreview
}) => {
  const { trackEvent } = useProposalAnalytics();

  const handleDownload = async () => {
    try {
      // Track download event
      await trackEvent(proposalId, 'download', {
        source: 'download_button',
        timestamp: new Date().toISOString()
      });
      
      // Execute download action
      if (onDownload) {
        onDownload();
      } else {
        // Default download behavior
        toast.success('Descarga iniciada');
      }
    } catch (error) {
      toast.error('Error al descargar la propuesta');
    }
  };

  const handleShare = async () => {
    try {
      // Track share event
      await trackEvent(proposalId, 'share', {
        source: 'share_button',
        timestamp: new Date().toISOString()
      });
      
      // Execute share action
      if (onShare) {
        onShare();
      } else {
        // Default share behavior
        if (navigator.share) {
          await navigator.share({
            title: 'Propuesta',
            text: 'Te comparto esta propuesta',
            url: window.location.href
          });
        } else {
          // Fallback: copy to clipboard
          await navigator.clipboard.writeText(window.location.href);
          toast.success('Enlace copiado al portapapeles');
        }
      }
    } catch (error) {
      toast.error('Error al compartir la propuesta');
    }
  };

  const handleEmail = async () => {
    try {
      // Track email action
      await trackEvent(proposalId, 'email_click', {
        source: 'email_button',
        timestamp: new Date().toISOString()
      });
      
      // Execute email action
      if (onEmail) {
        onEmail();
      } else {
        toast.success('Función de email próximamente');
      }
    } catch (error) {
      toast.error('Error al enviar email');
    }
  };

  const handlePreview = async () => {
    try {
      // Track preview event
      await trackEvent(proposalId, 'view', {
        source: 'preview_button',
        timestamp: new Date().toISOString()
      });
      
      // Execute preview action
      if (onPreview) {
        onPreview();
      }
    } catch (error) {
      console.error('Error tracking preview:', error);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {onPreview && (
        <Button variant="outline" size="sm" onClick={handlePreview}>
          <Eye className="h-4 w-4 mr-2" />
          Vista Previa
        </Button>
      )}
      
      <Button variant="outline" size="sm" onClick={handleEmail}>
        <Mail className="h-4 w-4 mr-2" />
        Enviar Email
      </Button>
      
      <Button variant="outline" size="sm" onClick={handleShare}>
        <Share2 className="h-4 w-4 mr-2" />
        Compartir
      </Button>
      
      <Button variant="default" size="sm" onClick={handleDownload}>
        <Download className="h-4 w-4 mr-2" />
        Descargar PDF
      </Button>
    </div>
  );
};