import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Download, Share2, Printer } from 'lucide-react';
import { CreateProposalData } from '@/types/Proposal';
import { TEMPLATE_VARIABLES } from '@/types/ProposalTemplate';
import { SecureHtmlRenderer } from '@/components/security/SecureHtmlRenderer';

interface ContentPreviewProps {
  data: CreateProposalData;
  content: string;
  onDownload?: () => void;
  onShare?: () => void;
  onPrint?: () => void;
}

export const ContentPreview: React.FC<ContentPreviewProps> = ({
  data,
  content,
  onDownload,
  onShare,
  onPrint
}) => {
  // Procesar variables en el contenido
  const processedContent = useMemo(() => {
    let processed = content;
    
    // Reemplazar variables con valores reales
    TEMPLATE_VARIABLES.forEach(variable => {
      const placeholder = `{{${variable.key}}}`;
      let value = '';
      
      switch (variable.key) {
        case 'cliente.nombre':
          value = 'Cliente Ejemplo'; // En producción vendría de data.contact
          break;
        case 'empresa.nombre':
          value = 'Empresa Ejemplo'; // En producción vendría de data.company
          break;
        case 'fecha.hoy':
          value = new Date().toLocaleDateString('es-ES');
          break;
        case 'proyecto.duracion':
          value = data.title || 'Proyecto Sin Título';
          break;
        case 'honorarios.total':
          value = data.total_amount ? 
            new Intl.NumberFormat('es-ES', {
              style: 'currency',
              currency: data.currency || 'EUR'
            }).format(data.total_amount) : 
            '€0,00';
          break;
        default:
          value = variable.example || `{{${variable.key}}}`;
      }
      
      processed = processed.replace(new RegExp(placeholder, 'g'), value);
    });
    
    return processed;
  }, [content, data]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Vista Previa</span>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            {onPrint && (
              <Button variant="outline" size="sm" onClick={onPrint}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
            )}
            {onShare && (
              <Button variant="outline" size="sm" onClick={onShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Compartir
              </Button>
            )}
            {onDownload && (
              <Button variant="default" size="sm" onClick={onDownload}>
                <Download className="h-4 w-4 mr-2" />
                Descargar PDF
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Información de la propuesta */}
        <div className="mb-6 p-4 bg-muted/50 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Título:</span>
              <p className="text-muted-foreground">{data.title || 'Sin título'}</p>
            </div>
            <div>
              <span className="font-medium">Tipo:</span>
              <p className="text-muted-foreground">
                {data.proposal_type === 'punctual' ? 'Puntual' : 'Recurrente'}
              </p>
            </div>
            <div>
              <span className="font-medium">Importe Total:</span>
              <p className="text-muted-foreground">
                {data.total_amount ? 
                  new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: data.currency || 'EUR'
                  }).format(data.total_amount) : 
                  'No especificado'
                }
              </p>
            </div>
            <div>
              <span className="font-medium">Válido hasta:</span>
              <p className="text-muted-foreground">
                {data.valid_until ? 
                  new Date(data.valid_until).toLocaleDateString('es-ES') : 
                  'No especificado'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Contenido procesado */}
        <div className="prose prose-sm max-w-none">
          <SecureHtmlRenderer 
            content={processedContent}
            className="ql-editor border-0 p-0"
            allowBasicFormatting={true}
          />
        </div>

        {/* Servicios si existen */}
        {data.services && data.services.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Servicios Incluidos</h3>
            <div className="space-y-3">
              {data.services.map((service, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded">
                  <div>
                    <h4 className="font-medium">{service.name}</h4>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Cantidad: {service.quantity} | Tipo: {service.billing_type}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {new Intl.NumberFormat('es-ES', {
                        style: 'currency',
                        currency: 'EUR'
                      }).format(service.total_price)}
                    </p>
                    {service.billing_type === 'hourly' && (
                      <p className="text-xs text-muted-foreground">
                        {service.hourly_rate}€/hora × {service.estimated_hours}h
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline si existe */}
        {data.timeline && data.timeline.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Cronograma</h3>
            <div className="space-y-3">
              {data.timeline.map((milestone, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-muted/30 rounded">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div className="flex-1">
                    <h4 className="font-medium">{milestone.title}</h4>
                    <p className="text-sm text-muted-foreground">{milestone.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Fecha estimada: {new Date(milestone.estimated_date).toLocaleDateString('es-ES')}
                    </p>
                    {milestone.deliverables.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium">Entregables:</p>
                        <ul className="text-xs text-muted-foreground list-disc list-inside">
                          {milestone.deliverables.map((deliverable, idx) => (
                            <li key={idx}>{deliverable}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Términos y condiciones */}
        {data.terms_and_conditions && (
          <div className="mt-6 p-4 bg-muted/30 rounded">
            <h3 className="text-lg font-semibold mb-2">Términos y Condiciones</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {data.terms_and_conditions}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};