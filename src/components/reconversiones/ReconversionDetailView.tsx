
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReconversiones } from '@/hooks/useReconversiones';
import { useReconversionCandidates } from '@/hooks/useReconversionCandidates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Building2, User, Calendar, Target, Users, Clock, Activity } from 'lucide-react';
import { ReconversionTimeline } from './ReconversionTimeline';
import { ReconversionCandidatesPanel } from './ReconversionCandidatesPanel';
import { ReconversionActions } from './ReconversionActions';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function ReconversionDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { reconversiones, updateReconversion } = useReconversiones();
  const { candidates } = useReconversionCandidates(id);
  
  const reconversion = reconversiones.find(r => r.id === id);

  if (!reconversion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold mb-2">Reconversión no encontrada</h2>
            <p className="text-muted-foreground mb-4">
              La reconversión que buscas no existe o no tienes permisos para verla.
            </p>
            <Button onClick={() => navigate('/reconversiones')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Reconversiones
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completada':
        return 'bg-green-100 text-green-800';
      case 'en_progreso':
        return 'bg-blue-100 text-blue-800';
      case 'pausada':
        return 'bg-yellow-100 text-yellow-800';
      case 'cerrada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const candidateStats = {
    total: candidates.length,
    interesados: candidates.filter(c => c.contact_status === 'interesado').length,
    contactados: candidates.filter(c => c.contact_status !== 'pendiente').length,
    pendientes: candidates.filter(c => c.contact_status === 'pendiente').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/reconversiones')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {reconversion.company_name}
            </h1>
            <p className="text-muted-foreground">
              Reconversión • Cliente: {reconversion.contact_name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={getStatusColor(reconversion.status)}>
            {reconversion.status}
          </Badge>
        <ReconversionActions 
          reconversion={reconversion} 
          onUpdate={async (id, updates) => {
            await updateReconversion(id, updates);
          }}
        />
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidatos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{candidateStats.total}</div>
            <p className="text-xs text-muted-foreground">
              empresas identificadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contactados</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{candidateStats.contactados}</div>
            <p className="text-xs text-muted-foreground">
              de {candidateStats.total} candidatos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interesados</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {candidateStats.interesados}
            </div>
            <p className="text-xs text-muted-foreground">
              respuestas positivas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa Conversión</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {candidateStats.contactados > 0 
                ? Math.round((candidateStats.interesados / candidateStats.contactados) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              interés generado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Información General */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Información General
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Empresa Objetivo
              </h4>
              <p className="font-medium">{reconversion.company_name}</p>
              {reconversion.target_sectors && reconversion.target_sectors.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Sectores: {reconversion.target_sectors.join(', ')}
                </p>
              )}
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Cliente de Contacto
              </h4>
              <p className="font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                {reconversion.contact_name}
              </p>
              {reconversion.contact_email && (
                <p className="text-sm text-muted-foreground">
                  {reconversion.contact_email}
                </p>
              )}
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Fechas Importantes
              </h4>
              <div className="space-y-1">
                <p className="text-sm flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  Creada: {format(new Date(reconversion.created_at), 'dd MMM yyyy', { locale: es })}
                </p>
              {/* Paused and closed dates will be handled by the actions component */}
              </div>
            </div>
          </div>

          {reconversion.rejection_reason && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Motivo de Rechazo Original
              </h4>
              <p className="text-sm bg-muted p-3 rounded-md">
                {reconversion.rejection_reason}
              </p>
            </div>
          )}

          {reconversion.notes && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Notas Adicionales
              </h4>
              <p className="text-sm bg-muted p-3 rounded-md">
                {reconversion.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs con contenido principal */}
      <Tabs defaultValue="candidates" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="candidates" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Candidatos ({candidateStats.total})
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Timeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="candidates">
          <ReconversionCandidatesPanel reconversionId={id!} />
        </TabsContent>

        <TabsContent value="timeline">
          <ReconversionTimeline reconversionId={id!} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
