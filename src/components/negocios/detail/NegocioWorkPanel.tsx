
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Users, 
  Calendar, 
  TrendingUp, 
  MessageSquare, 
  CheckSquare,
  Euro,
  Clock,
  Target
} from 'lucide-react';
import { Negocio } from '@/types/Negocio';

interface NegocioWorkPanelProps {
  negocio: Negocio;
}

export const NegocioWorkPanel = ({ negocio }: NegocioWorkPanelProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="buyers">Compradores</TabsTrigger>
          <TabsTrigger value="tasks">Tareas</TabsTrigger>
          <TabsTrigger value="communications">Comunicación</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Widgets de métricas */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor del Negocio</CardTitle>
                <Euro className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })
                    .format(negocio.valor_negocio || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {negocio.multiplicador && `Múltiplo: ${negocio.multiplicador}x`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tiempo en Pipeline</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.floor((new Date().getTime() - new Date(negocio.created_at).getTime()) / (1000 * 60 * 60 * 24))} días
                </div>
                <p className="text-xs text-muted-foreground">
                  Desde creación
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estado Actual</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {negocio.stage?.name || 'Sin etapa'}
                </div>
                <Badge 
                  variant="outline" 
                  className="mt-2"
                  style={{ 
                    backgroundColor: negocio.stage?.color + '20', 
                    borderColor: negocio.stage?.color 
                  }}
                >
                  {negocio.prioridad}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Panel de acciones rápidas */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-16 flex flex-col items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <span className="text-xs">Subir Documento</span>
                </Button>
                <Button variant="outline" className="h-16 flex flex-col items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span className="text-xs">Añadir Comprador</span>
                </Button>
                <Button variant="outline" className="h-16 flex flex-col items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span className="text-xs">Programar Reunión</span>
                </Button>
                <Button variant="outline" className="h-16 flex flex-col items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  <span className="text-xs">Enviar Email</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Gestión Documental
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No hay documentos</h3>
                <p className="text-sm mb-4">Sube documentos relacionados con este negocio</p>
                <Button>
                  Subir Documento
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="buyers" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gestión de Compradores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No hay compradores registrados</h3>
                <p className="text-sm mb-4">Añade compradores potenciales para este negocio</p>
                <Button>
                  Añadir Comprador
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                Lista de Tareas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <CheckSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No hay tareas pendientes</h3>
                <p className="text-sm mb-4">Crea tareas para organizar el proceso de venta</p>
                <Button>
                  Nueva Tarea
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Historial de Comunicaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No hay comunicaciones registradas</h3>
                <p className="text-sm mb-4">Las comunicaciones con compradores aparecerán aquí</p>
                <Button>
                  Nueva Comunicación
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Análisis Financiero
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-4">Métricas Financieras</h4>
                  <div className="space-y-3">
                    {negocio.ingresos && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Ingresos Anuales:</span>
                        <span className="font-medium">
                          {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })
                            .format(negocio.ingresos)}
                        </span>
                      </div>
                    )}
                    {negocio.ebitda && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">EBITDA:</span>
                        <span className="font-medium">
                          {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })
                            .format(negocio.ebitda)}
                        </span>
                      </div>
                    )}
                    {negocio.empleados && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Empleados:</span>
                        <span className="font-medium">{negocio.empleados}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-4">Ratios de Valoración</h4>
                  <div className="space-y-3">
                    {negocio.multiplicador && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Múltiplo EBITDA:</span>
                        <span className="font-medium">{negocio.multiplicador}x</span>
                      </div>
                    )}
                    {negocio.ingresos && negocio.valor_negocio && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Múltiplo Ingresos:</span>
                        <span className="font-medium">
                          {(negocio.valor_negocio / negocio.ingresos).toFixed(2)}x
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
