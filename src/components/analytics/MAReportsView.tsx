
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  FileText, 
  TrendingUp, 
  Users, 
  Building2,
  PieChart,
  Calendar,
  Filter
} from "lucide-react";

interface MAReport {
  id: string;
  name: string;
  type: 'executive' | 'deals' | 'activities' | 'contacts';
  description: string;
  lastGenerated: string;
  status: 'ready' | 'generating' | 'error';
  format: 'pdf' | 'excel' | 'json';
}

export const MAReportsView = () => {
  const [reports, setReports] = useState<MAReport[]>([]);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  // Cargar reportes disponibles
  useEffect(() => {
    const defaultReports: MAReport[] = [
      {
        id: '1',
        name: 'Reporte Ejecutivo M&A',
        type: 'executive',
        description: 'Resumen ejecutivo con KPIs principales, pipeline status y métricas de performance',
        lastGenerated: '2025-06-27',
        status: 'ready',
        format: 'pdf'
      },
      {
        id: '2',
        name: 'Análisis de Pipeline',
        type: 'deals',
        description: 'Análisis detallado del pipeline con conversion rates y forecasting',
        lastGenerated: '2025-06-26',
        status: 'ready',
        format: 'excel'
      },
      {
        id: '3',
        name: 'Reporte de Actividades',
        type: 'activities',
        description: 'Productividad del equipo, distribución de actividades y análisis temporal',
        lastGenerated: '2025-06-25',
        status: 'ready',
        format: 'pdf'
      },
      {
        id: '4',
        name: 'Análisis de Red de Contactos',
        type: 'contacts',
        description: 'Mapeo de relaciones, contactos clave y análisis por industria',
        lastGenerated: '2025-06-24',
        status: 'generating',
        format: 'json'
      }
    ];
    setReports(defaultReports);
  }, []);

  const getReportIcon = (type: MAReport['type']) => {
    switch (type) {
      case 'executive':
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'deals':
        return <PieChart className="h-5 w-5 text-green-600" />;
      case 'activities':
        return <Calendar className="h-5 w-5 text-purple-600" />;
      case 'contacts':
        return <Users className="h-5 w-5 text-orange-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: MAReport['status']) => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'generating':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: MAReport['status']) => {
    switch (status) {
      case 'ready':
        return 'Listo';
      case 'generating':
        return 'Generando...';
      case 'error':
        return 'Error';
      default:
        return 'Desconocido';
    }
  };

  const handleGenerateReport = async (reportId: string) => {
    setIsGenerating(reportId);
    
    // Simular generación de reporte
    setTimeout(() => {
      setReports(prev => prev.map(report => 
        report.id === reportId 
          ? { ...report, status: 'ready' as const, lastGenerated: new Date().toISOString().split('T')[0] }
          : report
      ));
      setIsGenerating(null);
    }, 3000);
  };

  const handleDownloadReport = (report: MAReport) => {
    // Simular descarga
    console.log(`Descargando reporte: ${report.name} en formato ${report.format}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes M&A</h1>
          <p className="text-gray-600 mt-1">
            Reportes especializados para análisis de fusiones y adquisiciones
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Programar
          </Button>
        </div>
      </div>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">12</div>
                <div className="text-sm text-gray-600">Reportes Disponibles</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Download className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">247</div>
                <div className="text-sm text-gray-600">Descargas Este Mes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">8</div>
                <div className="text-sm text-gray-600">Reportes Programados</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">94%</div>
                <div className="text-sm text-gray-600">Precisión Datos</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Reportes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reports.map((report) => (
          <Card key={report.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getReportIcon(report.type)}
                  <div>
                    <CardTitle className="text-lg">{report.name}</CardTitle>
                    <Badge className={`${getStatusColor(report.status)} mt-1`}>
                      {getStatusText(report.status)}
                    </Badge>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <div>Último: {report.lastGenerated}</div>
                  <div className="capitalize">{report.format.toUpperCase()}</div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-gray-600 mb-4">{report.description}</p>
              
              <div className="flex gap-2">
                {report.status === 'ready' ? (
                  <>
                    <Button 
                      size="sm" 
                      onClick={() => handleDownloadReport(report)}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Descargar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleGenerateReport(report.id)}
                      disabled={isGenerating === report.id}
                    >
                      Regenerar
                    </Button>
                  </>
                ) : (
                  <Button 
                    size="sm" 
                    onClick={() => handleGenerateReport(report.id)}
                    disabled={isGenerating === report.id || report.status === 'generating'}
                    className="flex-1"
                  >
                    {isGenerating === report.id || report.status === 'generating' ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generando...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Generar
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plantillas de Reportes Personalizados */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Plantillas de Reportes Personalizados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="font-medium mb-2">Reporte de Sector</div>
              <div className="text-sm text-gray-600 mb-3">
                Análisis específico por industria con comparables y tendencias
              </div>
              <Button size="sm" variant="outline" className="w-full">
                Crear Reporte
              </Button>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="font-medium mb-2">Due Diligence Summary</div>
              <div className="text-sm text-gray-600 mb-3">
                Resumen consolidado del proceso de due diligence
              </div>
              <Button size="sm" variant="outline" className="w-full">
                Crear Reporte
              </Button>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="font-medium mb-2">Pitch Book</div>
              <div className="text-sm text-gray-600 mb-3">
                Presentación profesional para clientes potenciales
              </div>
              <Button size="sm" variant="outline" className="w-full">
                Crear Reporte
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
