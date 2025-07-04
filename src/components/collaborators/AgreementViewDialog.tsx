import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collaborator } from '@/types/Collaborator';
import { useDocuments } from '@/hooks/useDocuments';
import { Download, Send, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AgreementViewDialogProps {
  collaborator: Collaborator | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AgreementViewDialog: React.FC<AgreementViewDialogProps> = ({
  collaborator,
  isOpen,
  onClose
}) => {
  const { documents } = useDocuments();
  const { toast } = useToast();

  if (!collaborator || !collaborator.agreement_id) {
    return null;
  }

  const agreement = documents.find(doc => doc.id === collaborator.agreement_id);

  const handleDownloadPDF = async () => {
    try {
      // Esta funcionalidad ya existe en DocumentEditor
      toast({
        title: "Descarga iniciada",
        description: "El PDF del acuerdo se está generando...",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar el PDF del acuerdo",
        variant: "destructive",
      });
    }
  };

  const handleSendAgreement = async () => {
    try {
      // TODO: Implementar envío por email
      toast({
        title: "Acuerdo enviado",
        description: `El acuerdo ha sido enviado a ${collaborator.email}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar el acuerdo",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'generated':
        return 'bg-blue-100 text-blue-800';
      case 'sent':
        return 'bg-purple-100 text-purple-800';
      case 'signed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'generated':
        return 'Generado';
      case 'sent':
        return 'Enviado';
      case 'signed':
        return 'Firmado';
      default:
        return 'Desconocido';
    }
  };

  const processContent = (content: string) => {
    if (!agreement || !agreement.variables) return content;
    
    let processedContent = content;
    Object.entries(agreement.variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processedContent = processedContent.replace(regex, value as string || `[${key}]`);
    });
    
    return processedContent;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Acuerdo de Colaboración - {collaborator.name}</span>
              </DialogTitle>
              <div className="flex items-center space-x-2 mt-2">
                <Badge className={getStatusColor(collaborator.agreement_status)}>
                  {getStatusLabel(collaborator.agreement_status)}
                </Badge>
                {collaborator.agreement_date && (
                  <span className="text-sm text-gray-500">
                    Generado el {new Date(collaborator.agreement_date).toLocaleDateString('es-ES')}
                  </span>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              {collaborator.agreement_status === 'generated' && collaborator.email && (
                <Button onClick={handleSendAgreement} size="sm">
                  <Send className="h-4 w-4 mr-2" />
                  Enviar por Email
                </Button>
              )}
              <Button onClick={handleDownloadPDF} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Descargar PDF
              </Button>
            </div>
          </div>
        </DialogHeader>

        {agreement && (
          <div className="mt-6">
            <div 
              className="prose max-w-none border rounded-lg p-6 bg-white min-h-[400px] text-sm"
              dangerouslySetInnerHTML={{ 
                __html: processContent(agreement.content?.content || '') 
              }}
            />
          </div>
        )}

        {!agreement && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">Acuerdo no encontrado</h3>
            <p className="text-sm">
              No se pudo cargar el contenido del acuerdo
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};