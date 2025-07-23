
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Building2,
  User,
  Calendar,
  FileText,
  MessageSquare,
  BarChart3,
  X,
  Edit,
  Euro
} from 'lucide-react';
import { ValoracionCommentForm } from './ValoracionCommentForm';
import { ValoracionActivityPanel } from './ValoracionActivityPanel';
import { useValoracionComments } from '@/hooks/useValoracionComments';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Database } from '@/integrations/supabase/types';

type Valoracion = Database['public']['Tables']['valoraciones']['Row'];

interface ValoracionDetailPanelProps {
  valoracion: Valoracion | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}

const getStatusColor = (status: string) => {
  const colors = {
    requested: 'bg-yellow-100 text-yellow-800',
    in_process: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    delivered: 'bg-emerald-100 text-emerald-800'
  };
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

const getStatusLabel = (status: string) => {
  const labels = {
    requested: 'Solicitada',
    in_process: 'En Proceso',
    completed: 'Completada',
    delivered: 'Entregada'
  };
  return labels[status as keyof typeof labels] || status;
};

export function ValoracionDetailPanel({ 
  valoracion, 
  open, 
  onOpenChange, 
  onClose 
}: ValoracionDetailPanelProps) {
  const [activeTab, setActiveTab] = useState('overview');
  
  const {
    comments,
    loading: commentsLoading,
    addComment
  } = useValoracionComments(valoracion?.id);

  if (!valoracion) return null;

  const handleCommentSubmit = async (commentData: {
    comment_text: string;
    comment_type: any;
    metadata?: Record<string, any>;
  }) => {
    await addComment(commentData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6" />
            <div>
              <DialogTitle className="text-xl">{valoracion.company_name}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getStatusColor(valoracion.status)}>
                  {getStatusLabel(valoracion.status)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Cliente: {valoracion.client_name}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="comments">
                Comentarios
                {comments.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {comments.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="activity">Actividad</TabsTrigger>
              <TabsTrigger value="documents">Documentos</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-4">
              <TabsContent value="overview" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Información General */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Información General
                      </CardTitle>
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

                  {/* Detalles del Proyecto */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Detalles del Proyecto
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Estado</label>
                        <Badge className={getStatusColor(valoracion.status)}>
                          {getStatusLabel(valoracion.status)}
                        </Badge>
                      </div>
                      {valoracion.assigned_to && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Asignado a</label>
                          <p className="text-sm flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {valoracion.assigned_to}
                          </p>
                        </div>
                      )}
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Fecha de Creación</label>
                        <p className="text-sm flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(valoracion.created_at), 'dd/MM/yyyy', { locale: es })}
                        </p>
                      </div>
                      {valoracion.estimated_delivery && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Entrega Estimada</label>
                          <p className="text-sm flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(valoracion.estimated_delivery), 'dd/MM/yyyy', { locale: es })}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Información Financiera */}
                {(valoracion.fee_quoted || valoracion.fee_charged) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Euro className="h-5 w-5" />
                        Información Financiera
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {valoracion.fee_quoted && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Honorarios Cotizados</label>
                            <p className="text-lg font-semibold">
                              {valoracion.fee_quoted.toLocaleString('es-ES')} {valoracion.fee_currency || 'EUR'}
                            </p>
                          </div>
                        )}
                        {valoracion.fee_charged && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Honorarios Facturados</label>
                            <p className="text-lg font-semibold">
                              {valoracion.fee_charged.toLocaleString('es-ES')} {valoracion.fee_currency || 'EUR'}
                            </p>
                          </div>
                        )}
                        {valoracion.payment_status && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Estado de Pago</label>
                            <Badge variant={valoracion.payment_status === 'paid' ? 'default' : 'secondary'}>
                              {valoracion.payment_status === 'paid' ? 'Pagado' : 
                               valoracion.payment_status === 'pending' ? 'Pendiente' :
                               valoracion.payment_status === 'partial' ? 'Parcial' : 'Vencido'}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="comments" className="space-y-6 mt-0">
                <ValoracionCommentForm onSubmit={handleCommentSubmit} loading={commentsLoading} />
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Historial de Comentarios ({comments.length})
                  </h3>
                  
                  {comments.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-8">
                        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          No hay comentarios aún. ¡Añade el primero!
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <Card key={comment.id}>
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">
                                  {comment.comment_type === 'note' ? 'Nota' :
                                   comment.comment_type === 'status_change' ? 'Cambio de Estado' :
                                   comment.comment_type === 'phase_change' ? 'Cambio de Fase' :
                                   comment.comment_type === 'approval' ? 'Aprobación' :
                                   comment.comment_type === 'rejection' ? 'Rechazo' :
                                   comment.comment_type === 'document_update' ? 'Documento' :
                                   'Asignación'}
                                </Badge>
                                <span className="text-sm font-medium">{comment.user_name}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(comment.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                              </span>
                            </div>
                            <p className="text-sm">{comment.comment_text}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="activity" className="mt-0">
                <ValoracionActivityPanel valoracionId={valoracion.id} />
              </TabsContent>

              <TabsContent value="documents" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Documentos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-muted-foreground py-8">
                      Sistema de documentos en desarrollo
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
