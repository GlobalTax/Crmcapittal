import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, ArrowUpRight } from 'lucide-react';
import { useReconversionRelations } from '@/hooks/useReconversionRelations';
import { Reconversion } from '@/types/Reconversion';
import type { Database } from '@/integrations/supabase/types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface ReconversionRelatedListProps {
  entityType: 'lead' | 'mandate';
  entityId: string;
  entityName: string;
  onCreateReconversion?: () => void;
}

export const ReconversionRelatedList = ({ 
  entityType, 
  entityId, 
  entityName,
  onCreateReconversion 
}: ReconversionRelatedListProps) => {
  const [reconversions, setReconversions] = useState<Database['public']['Tables']['reconversiones']['Row'][]>([]);
  const { 
    loading, 
    getReconversionsByLead, 
    getReconversionsByMandate 
  } = useReconversionRelations();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReconversions = async () => {
      try {
        let data: Database['public']['Tables']['reconversiones']['Row'][];
        if (entityType === 'lead') {
          data = await getReconversionsByLead(entityId);
        } else {
          data = await getReconversionsByMandate(entityId);
        }
        setReconversions(data);
      } catch (error) {
        console.error('Error fetching reconversions:', error);
      }
    };

    fetchReconversions();
  }, [entityType, entityId, getReconversionsByLead, getReconversionsByMandate]);

  const getStatusVariant = (status?: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'matching': return 'secondary';
      case 'paused': return 'outline';
      case 'closed': return 'destructive';
      default: return 'outline';
    }
  };

  const getPriorityVariant = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Cargando reconversiones...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Reconversiones Asociadas ({reconversions.length})
          </CardTitle>
          {onCreateReconversion && (
            <Button 
              size="sm" 
              onClick={onCreateReconversion}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nueva Reconversión
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {reconversions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No hay reconversiones asociadas a este {entityType === 'lead' ? 'lead' : 'mandato'}.</p>
            {onCreateReconversion && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={onCreateReconversion}
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Reconversión
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {reconversions.map((reconversion) => (
              <div 
                key={reconversion.id}
                className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{reconversion.company_name}</h4>
                      <Badge variant={getStatusVariant(reconversion.status)}>
                        {reconversion.status}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {reconversion.contact_name} • {reconversion.contact_email}
                    </p>
                    
                    <p className="text-sm line-clamp-2 mb-2">
                      <strong>Motivo:</strong> {reconversion.rejection_reason}
                    </p>
                    
                    {reconversion.target_sectors && reconversion.target_sectors.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {reconversion.target_sectors.slice(0, 3).map((sector, index) => (
                          <Badge key={index} variant="outline">
                            {sector}
                          </Badge>
                        ))}
                        {reconversion.target_sectors.length > 3 && (
                          <Badge variant="outline">
                            +{reconversion.target_sectors.length - 3} más
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        Creada {formatDistanceToNow(new Date(reconversion.created_at), { 
                          addSuffix: true, 
                          locale: es 
                        })}
                      </span>
                      {reconversion.investment_capacity_min && reconversion.investment_capacity_max && (
                        <span>
                          €{reconversion.investment_capacity_min.toLocaleString()} - 
                          €{reconversion.investment_capacity_max.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/reconversiones?id=${reconversion.id}`)}
                    className="ml-4"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};