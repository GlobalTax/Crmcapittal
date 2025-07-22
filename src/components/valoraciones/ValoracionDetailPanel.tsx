
import React, { useState } from 'react';
import { Valoracion } from '@/types/Valoracion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Edit, Share, Download } from 'lucide-react';
import { VALORACION_PHASES } from '@/utils/valoracionPhases';
import { formatCurrency } from '@/utils/format';
import { ValoracionDocumentsList } from './ValoracionDocumentsList';
import { ValoracionHistoryModal } from './ValoracionHistoryModal';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ValoracionDetailPanelProps {
  valoracion: Valoracion;
  onClose: () => void;
  onEdit: (valoracion: Valoracion) => void;
  onGenerateClientLink?: (valoracion: Valoracion) => void;
  className?: string;
}

export const ValoracionDetailPanel: React.FC<ValoracionDetailPanelProps> = ({
  valoracion,
  onClose,
  onEdit,
  onGenerateClientLink,
  className = ""
}) => {
  const [activeTab, setActiveTab] = useState('details');
  const [showHistory, setShowHistory] = useState(false);
  
  const phase = VALORACION_PHASES[valoracion.status];
  
  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pagado';
      case 'partial': return 'Parcial';
      case 'overdue': return 'Vencido';
      default: return 'Pendiente';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`h-full flex flex-col bg-background ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-4">
          <div className="text-2xl">{phase.icon}</div>
          <div>
            <h2 className="text-xl font-semibold">{valoracion.company_name}</h2>
            <p className="text-muted-foreground">Cliente: {valoracion.client_name}</p>
          </div>
          <Badge className={phase.bgColor + ' ' + phase.textColor}>
            {phase.label}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(valoracion)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          
          {onGenerateClientLink && valoracion.status === 'delivered' && (
            <Button variant="outline" size="sm" onClick={() => onGenerateClientLink(valoracion)}>
              <Share className="h-4 w-4 mr-2" />
              Enlace Cliente
            </Button>
          )}
          
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="details">Detalles</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
            <TabsTrigger value="comments">Comentarios</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
            <TabsTrigger value="audit">Auditoría</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* General Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información General</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Empresa</label>
                    <p className="text-sm">{valoracion.company_name}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Cliente</label>
                    <p className="text-sm">{valoracion.client_name}</p>
                  </div>
                  
                  {valoracion.company_sector && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Sector</label>
                      <p className="text-sm">{valoracion.company_sector}</p>
                    </div>
                  )}
                  
                  {valoracion.company_description && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Descripción</label>
                      <p className="text-sm">{valoracion.company_description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Financial Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información Financiera</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {valoracion.fee_quoted && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Honorarios Cotizados</label>
                      <p className="text-sm font-semibold">
                        {formatCurrency(valoracion.fee_quoted, valoracion.fee_currency)}
                      </p>
                    </div>
                  )}
                  
                  {valoracion.fee_charged && valoracion.fee_charged > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Honorarios Cobrados</label>
                      <p className="text-sm font-semibold text-green-600">
                        {formatCurrency(valoracion.fee_charged, valoracion.fee_currency)}
                      </p>
                    </div>
                  )}
                  
                  {valoracion.payment_status && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Estado de Pago</label>
                      <Badge className={`mt-1 ${getPaymentStatusColor(valoracion.payment_status)}`}>
                        {getPaymentStatusText(valoracion.payment_status)}
                      </Badge>
                    </div>
                  )}
                  
                  {valoracion.payment_date && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Fecha de Pago</label>
                      <p className="text-sm">
                        {format(new Date(valoracion.payment_date), 'dd/MM/yyyy', { locale: es })}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fechas Importantes</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fecha de Creación</label>
                  <p className="text-sm">
                    {format(new Date(valoracion.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Última Actualización</label>
                  <p className="text-sm">
                    {format(new Date(valoracion.updated_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </p>
                </div>
                
                {valoracion.estimated_delivery && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Entrega Estimada</label>
                    <p className="text-sm">
                      {format(new Date(valoracion.estimated_delivery), 'dd/MM/yyyy', { locale: es })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Documentos</CardTitle>
                <CardDescription>
                  Gestiona los documentos asociados a esta valoración
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ValoracionDocumentsList
                  valoracion={valoracion}
                  onRefresh={() => {
                    // Trigger refresh if needed
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments">
            <Card>
              <CardHeader>
                <CardTitle>Comentarios</CardTitle>
                <CardDescription>
                  Comentarios internos sobre esta valoración
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p>Sistema de comentarios en desarrollo</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Cambios</CardTitle>
                <CardDescription>
                  Registro de cambios de fase y actividad
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  onClick={() => setShowHistory(true)}
                  className="w-full"
                >
                  Ver Historial Completo
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Tab */}
          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle>Auditoría</CardTitle>
                <CardDescription>
                  Logs de seguridad y accesos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p>Sistema de auditoría en desarrollo</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* History Modal */}
      <ValoracionHistoryModal
        valoracion={valoracion}
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
      />
    </div>
  );
};
