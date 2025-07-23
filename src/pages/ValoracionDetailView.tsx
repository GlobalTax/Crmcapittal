
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Euro, Calendar, TrendingUp, Building2 } from 'lucide-react';
import { useValoraciones } from '@/hooks/useValoraciones';
import { VALORACION_PHASES } from '@/utils/valoracionPhases';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency } from '@/utils/format';

export default function ValoracionDetailView() {
  const { id } = useParams();
  const { valoraciones } = useValoraciones();
  
  const valoracion = valoraciones.find(v => v.id === id);

  if (!valoracion) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-muted-foreground">Valoración no encontrada</h1>
        </div>
      </div>
    );
  }

  const phase = VALORACION_PHASES[valoracion.status];
  const daysSinceCreation = Math.floor((Date.now() - new Date(valoracion.created_at).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Valoración #{valoracion.id.slice(0, 8)}</h1>
          <p className="text-muted-foreground">
            {valoracion.company_name} - {valoracion.client_name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`${phase.bgColor} ${phase.textColor}`}>
            {phase.icon} {phase.label}
          </Badge>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Generar Informe
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Honorarios Cotizados
            </CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {valoracion.fee_quoted ? formatCurrency(valoracion.fee_quoted) : 'Por definir'}
            </div>
            <p className="text-xs text-muted-foreground">
              {valoracion.fee_currency || 'EUR'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Días en Proceso
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{daysSinceCreation}</div>
            <p className="text-xs text-muted-foreground">
              desde la solicitud
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Estado del Pago
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {valoracion.payment_status === 'paid' ? 'Pagado' : 'Pendiente'}
            </div>
            <p className="text-xs text-muted-foreground">
              {valoracion.fee_charged ? formatCurrency(valoracion.fee_charged) : 'No facturado'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Progreso
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {valoracion.status === 'delivered' ? '100%' : 
               valoracion.status === 'completed' ? '80%' : 
               valoracion.status === 'in_process' ? '40%' : '20%'}
            </div>
            <p className="text-xs text-muted-foreground">
              {phase.description}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información de la Empresa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Empresa</h4>
              <p className="text-sm text-muted-foreground">{valoracion.company_name}</p>
            </div>
            {valoracion.company_sector && (
              <div>
                <h4 className="font-medium mb-2">Sector</h4>
                <p className="text-sm text-muted-foreground">{valoracion.company_sector}</p>
              </div>
            )}
            {valoracion.company_description && (
              <div>
                <h4 className="font-medium mb-2">Descripción</h4>
                <p className="text-sm text-muted-foreground">{valoracion.company_description}</p>
              </div>
            )}
            <div>
              <h4 className="font-medium mb-2">Cliente</h4>
              <p className="text-sm text-muted-foreground">{valoracion.client_name}</p>
            </div>
            {valoracion.assigned_to && (
              <div>
                <h4 className="font-medium mb-2">Asignado a</h4>
                <p className="text-sm text-muted-foreground">{valoracion.assigned_to}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documentación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Informe de Valoración</span>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Documentación Financiera</span>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Análisis de Mercado</span>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cronología de la Valoración</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {valoracion.status === 'delivered' && (
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-1"></div>
                <div>
                  <p className="text-sm font-medium">Valoración entregada</p>
                  <p className="text-xs text-muted-foreground">Informe final enviado al cliente</p>
                  <p className="text-xs text-muted-foreground">Completado</p>
                </div>
              </div>
            )}
            
            {(valoracion.status === 'completed' || valoracion.status === 'delivered') && (
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full mt-1"></div>
                <div>
                  <p className="text-sm font-medium">Análisis completado</p>
                  <p className="text-xs text-muted-foreground">Valoración finalizada, preparando entrega</p>
                  <p className="text-xs text-muted-foreground">
                    {valoracion.status === 'completed' ? 'En curso' : 'Completado'}
                  </p>
                </div>
              </div>
            )}
            
            {valoracion.status !== 'requested' && (
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mt-1"></div>
                <div>
                  <p className="text-sm font-medium">Análisis iniciado</p>
                  <p className="text-xs text-muted-foreground">Equipo asignado y trabajo en progreso</p>
                  <p className="text-xs text-muted-foreground">
                    {valoracion.status === 'in_process' ? 'En curso' : 'Completado'}
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex items-start space-x-3">
              <div className="w-3 h-3 bg-gray-400 rounded-full mt-1"></div>
              <div>
                <p className="text-sm font-medium">Solicitud recibida</p>
                <p className="text-xs text-muted-foreground">Valoración solicitada por {valoracion.client_name}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(valoracion.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
