import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, FileText, Users, MessageSquare, Edit, ExternalLink, Phone, Mail } from 'lucide-react';
import { Transaccion } from '@/types/Transaccion';

interface InlineTransaccionDetailProps {
  transaccion: Transaccion;
}

export const InlineTransaccionDetail: React.FC<InlineTransaccionDetailProps> = ({ transaccion }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Datos mock para demostrar funcionalidad - en implementación real vendrían de la API
  const mockActividades = [
    { id: 1, tipo: 'call', fecha: '2024-01-15', descripcion: 'Llamada inicial con CEO', usuario: 'Juan Pérez' },
    { id: 2, tipo: 'email', fecha: '2024-01-12', descripcion: 'Envío de propuesta inicial', usuario: 'Juan Pérez' },
    { id: 3, tipo: 'meeting', fecha: '2024-01-10', descripcion: 'Reunión de descubrimiento', usuario: 'Juan Pérez' }
  ];

  const mockDocumentos = [
    { id: 1, nombre: 'Propuesta_Comercial_v2.pdf', tipo: 'propuesta', fecha: '2024-01-15' },
    { id: 2, nombre: 'NDA_Firmado.pdf', tipo: 'legal', fecha: '2024-01-10' },
    { id: 3, nombre: 'Análisis_Financiero.xlsx', tipo: 'analisis', fecha: '2024-01-08' }
  ];

  const getActivityIcon = (tipo: string) => {
    switch (tipo) {
      case 'call': return <Phone className="h-4 w-4 text-blue-500" />;
      case 'email': return <Mail className="h-4 w-4 text-green-500" />;
      case 'meeting': return <Users className="h-4 w-4 text-purple-500" />;
      default: return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card className="border-t-0 rounded-t-none bg-accent/20">
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="grid w-fit grid-cols-4">
              <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
              <TabsTrigger value="contactos" className="text-xs">Contactos</TabsTrigger>
              <TabsTrigger value="documentos" className="text-xs">Documentos</TabsTrigger>
              <TabsTrigger value="actividades" className="text-xs">Actividad</TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/transacciones/${transaccion.id}`)}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Análisis completo
              </Button>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Información Principal */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Detalles de la Transacción</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Valor:</span>
                      <span className="text-sm font-medium">{formatCurrency(transaccion.valor_transaccion || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Tipo:</span>
                      <Badge variant="outline" className="text-xs">{transaccion.tipo_transaccion}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Prioridad:</span>
                      <Badge variant="outline" className="text-xs">{transaccion.prioridad}</Badge>
                    </div>
                    {transaccion.fecha_cierre && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Fecha cierre:</span>
                        <span className="text-sm">{new Date(transaccion.fecha_cierre).toLocaleDateString('es-ES')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Información de la Empresa */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Empresa</h4>
                  {transaccion.company ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {transaccion.company.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{transaccion.company.name}</p>
                          {transaccion.company.industry && (
                            <p className="text-xs text-muted-foreground">{transaccion.company.industry}</p>
                          )}
                        </div>
                      </div>
                      {transaccion.company.website && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Website:</span>
                          <a href={transaccion.company.website} className="text-sm text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                            {transaccion.company.website}
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No asignada</p>
                  )}
                </div>
              </div>

              {/* Métricas Financieras */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Métricas</h4>
                  <div className="space-y-2">
                    {transaccion.ebitda && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">EBITDA:</span>
                        <span className="text-sm font-medium">{formatCurrency(transaccion.ebitda)}</span>
                      </div>
                    )}
                    {transaccion.ingresos && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Ingresos:</span>
                        <span className="text-sm font-medium">{formatCurrency(transaccion.ingresos)}</span>
                      </div>
                    )}
                    {transaccion.multiplicador && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Multiplicador:</span>
                        <span className="text-sm font-medium">{transaccion.multiplicador}x</span>
                      </div>
                    )}
                    {transaccion.empleados && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Empleados:</span>
                        <span className="text-sm">{transaccion.empleados}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Descripción y Notas */}
            {(transaccion.descripcion || transaccion.notas) && (
              <div className="space-y-4 pt-4 border-t">
                {transaccion.descripcion && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Descripción</h4>
                    <p className="text-sm text-foreground">{transaccion.descripcion}</p>
                  </div>
                )}
                {transaccion.notas && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Notas</h4>
                    <p className="text-sm text-muted-foreground">{transaccion.notas}</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="contactos" className="space-y-4">
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground">Contactos</h3>
              <p className="text-muted-foreground mb-4">
                Gestiona los contactos relacionados con esta transacción
              </p>
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Añadir Contacto
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="documentos" className="space-y-4">
            <div className="space-y-3">
              {mockDocumentos.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{doc.nombre}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.tipo} • {new Date(doc.fecha).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Subir Documento
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="actividades" className="space-y-4">
            <div className="space-y-3">
              {mockActividades.map((actividad) => (
                <div key={actividad.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="mt-1">
                    {getActivityIcon(actividad.tipo)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{actividad.descripcion}</p>
                    <p className="text-xs text-muted-foreground">
                      {actividad.usuario} • {new Date(actividad.fecha).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Nueva Actividad
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};