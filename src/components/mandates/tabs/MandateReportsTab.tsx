import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  Download, 
  FileText, 
  Target, 
  Calendar,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle
} from 'lucide-react';
import { BuyingMandate } from '@/types/BuyingMandate';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface MandateReportsTabProps {
  mandate: BuyingMandate;
}

export const MandateReportsTab: React.FC<MandateReportsTabProps> = ({ mandate }) => {
  // Mock data - En producción vendría de la base de datos
  const mandateMetrics = {
    targetsIdentified: 45,
    targetsContacted: 23,
    targetsInterested: 8,
    ndaSigned: 3,
    inAnalysis: 2,
    daysActive: 45,
    averageResponseTime: 3.2,
    conversionRate: 17.8,
    estimatedTimeToCompletion: 120
  };

  const monthlyProgress = [
    { month: 'Enero', targets: 15, contacted: 8, interested: 3 },
    { month: 'Febrero', targets: 20, contacted: 12, interested: 4 },
    { month: 'Marzo', targets: 10, contacted: 3, interested: 1 }
  ];

  const recentReports = [
    {
      id: '1',
      name: 'Informe Mensual - Enero 2024',
      type: 'monthly',
      generatedAt: new Date('2024-01-31T23:59:00'),
      size: '2.4 MB'
    },
    {
      id: '2',
      name: 'Análisis de Targets',
      type: 'targets',
      generatedAt: new Date('2024-01-28T14:30:00'),
      size: '1.8 MB'
    },
    {
      id: '3',
      name: 'Resumen Ejecutivo',
      type: 'executive',
      generatedAt: new Date('2024-01-25T09:15:00'),
      size: '850 KB'
    }
  ];

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'monthly': return 'bg-blue-100 text-blue-800';
      case 'targets': return 'bg-green-100 text-green-800';
      case 'executive': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'monthly': return 'Mensual';
      case 'targets': return 'Targets';
      case 'executive': return 'Ejecutivo';
      default: return 'Reporte';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Reportes y Análisis</h3>
          <p className="text-sm text-muted-foreground">
            Métricas, KPIs y reportes detallados del mandato
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Generar Reporte
          </Button>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Targets Identificados</p>
                <p className="text-2xl font-bold">{mandateMetrics.targetsIdentified}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tasa de Conversión</p>
                <p className="text-2xl font-bold">{mandateMetrics.conversionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Días Activo</p>
                <p className="text-2xl font-bold">{mandateMetrics.daysActive}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">NDAs Firmados</p>
                <p className="text-2xl font-bold">{mandateMetrics.ndaSigned}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Progreso del Mandato</CardTitle>
            <CardDescription>Estado actual del pipeline de targets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Targets Contactados</span>
                <span>{mandateMetrics.targetsContacted}/{mandateMetrics.targetsIdentified}</span>
              </div>
              <Progress value={(mandateMetrics.targetsContacted / mandateMetrics.targetsIdentified) * 100} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Targets Interesados</span>
                <span>{mandateMetrics.targetsInterested}/{mandateMetrics.targetsContacted}</span>
              </div>
              <Progress value={(mandateMetrics.targetsInterested / mandateMetrics.targetsContacted) * 100} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>En Análisis</span>
                <span>{mandateMetrics.inAnalysis}/{mandateMetrics.targetsInterested}</span>
              </div>
              <Progress value={(mandateMetrics.inAnalysis / mandateMetrics.targetsInterested) * 100} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métricas de Tiempo</CardTitle>
            <CardDescription>Análisis temporal del mandato</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Tiempo promedio de respuesta</span>
              </div>
              <span className="font-medium">{mandateMetrics.averageResponseTime} días</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Días activo</span>
              </div>
              <span className="font-medium">{mandateMetrics.daysActive} días</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Tiempo estimado finalización</span>
              </div>
              <span className="font-medium">{mandateMetrics.estimatedTimeToCompletion} días</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Progreso Mensual</CardTitle>
          <CardDescription>Evolución de targets por mes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyProgress.map((month, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{month.month}</h4>
                  <div className="flex space-x-4 text-sm">
                    <span className="text-blue-600">{month.targets} targets</span>
                    <span className="text-green-600">{month.contacted} contactados</span>
                    <span className="text-orange-600">{month.interested} interesados</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Identificados</p>
                    <Progress value={100} className="h-2" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Contactados</p>
                    <Progress value={(month.contacted / month.targets) * 100} className="h-2" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Interesados</p>
                    <Progress value={(month.interested / month.contacted) * 100} className="h-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Reportes Recientes</CardTitle>
          <CardDescription>Historial de reportes generados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{report.name}</p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Badge className={getReportTypeColor(report.type)}>
                        {getReportTypeLabel(report.type)}
                      </Badge>
                      <span>{report.size}</span>
                      <span>•</span>
                      <span>{format(report.generatedAt, 'dd/MM/yyyy HH:mm', { locale: es })}</span>
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};