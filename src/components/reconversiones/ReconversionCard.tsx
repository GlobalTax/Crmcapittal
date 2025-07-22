
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, User, Calendar, Eye, Users, Activity } from 'lucide-react';
import { useReconversionCandidates } from '@/hooks/useReconversionCandidates';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReconversionCardProps {
  reconversion: any;
}

export function ReconversionCard({ reconversion }: ReconversionCardProps) {
  const navigate = useNavigate();
  const { candidates } = useReconversionCandidates(reconversion.id);

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
    contactados: candidates.filter(c => c.contact_status !== 'pendiente').length
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {reconversion.company_name || 'Sin nombre'}
            </CardTitle>
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Cliente: {reconversion.contact_name}</span>
            </div>
            {reconversion.target_sectors && reconversion.target_sectors.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Sectores: {reconversion.target_sectors.join(', ')}
              </p>
            )}
          </div>
          <Badge className={getStatusColor(reconversion.status)}>
            {reconversion.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold">{candidateStats.total}</div>
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Users className="h-3 w-3" />
                Candidatos
              </div>
            </div>
            <div>
              <div className="text-lg font-semibold">{candidateStats.contactados}</div>
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Activity className="h-3 w-3" />
                Contactados
              </div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-600">
                {candidateStats.interesados}
              </div>
              <div className="text-xs text-muted-foreground">
                Interesados
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(reconversion.created_at), 'dd MMM yyyy', { locale: es })}
              </div>
              {candidateStats.total > 0 && candidateStats.contactados > 0 && (
                <div className="text-xs">
                  {Math.round((candidateStats.interesados / candidateStats.contactados) * 100)}% conversión
                </div>
              )}
            </div>
          </div>

          {/* Notas si existen */}
          {reconversion.notes && (
            <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
              {reconversion.notes.length > 100 
                ? `${reconversion.notes.substring(0, 100)}...` 
                : reconversion.notes
              }
            </div>
          )}

          {/* Acciones */}
          <div className="flex justify-end pt-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(`/reconversiones/${reconversion.id}`)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Detalle
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
