import React, { useState, useEffect } from 'react';
import { Valoracion } from '@/types/Valoracion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FileText, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';

interface ValoracionDocumentReview {
  id: string;
  document_id: string;
  previous_status: string | null;
  new_status: string;
  reviewed_by: string | null;
  review_notes: string | null;
  created_at: string;
  valoracion_documents: {
    file_name: string;
    document_type: string;
  };
  reviewer?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

interface ValoracionReviewTabProps {
  valoracion: Valoracion;
}

export const ValoracionReviewTab: React.FC<ValoracionReviewTabProps> = ({ valoracion }) => {
  const [reviews, setReviews] = useState<ValoracionDocumentReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [valoracion.id]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('valoracion_document_reviews')
        .select(`
          *,
          valoracion_documents!inner(file_name, document_type, valoracion_id),
          reviewer:user_profiles(first_name, last_name)
        `)
        .eq('valoracion_documents.valoracion_id', valoracion.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews((data as any) || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'under_review':
        return <Eye className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprobado';
      case 'rejected':
        return 'Rechazado';
      case 'under_review':
        return 'En Revisión';
      default:
        return 'Pendiente';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'under_review':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return <div className="p-4">Cargando revisiones...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Timeline de Revisiones</h3>
        <p className="text-sm text-muted-foreground">
          Historial de revisiones y cambios de estado de documentos
        </p>
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay revisiones registradas</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      {getStatusIcon(review.new_status)}
                    </div>
                    {index < reviews.length - 1 && (
                      <div className="w-px h-16 bg-border mt-2" />
                    )}
                  </div>

                  {/* Review content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{review.valoracion_documents.file_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Tipo: {review.valoracion_documents.document_type === 'deliverable' ? 'Entregable' : 'Interno'}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(review.new_status)}>
                        {getStatusText(review.new_status)}
                      </Badge>
                    </div>

                    {review.previous_status && (
                      <p className="text-sm text-muted-foreground">
                        Estado anterior: {getStatusText(review.previous_status)}
                      </p>
                    )}

                    {review.review_notes && (
                      <div className="bg-muted/50 p-3 rounded-md">
                        <p className="text-sm">{review.review_notes}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {review.reviewer ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {(review.reviewer.first_name?.charAt(0) || '') + 
                               (review.reviewer.last_name?.charAt(0) || '')}
                            </AvatarFallback>
                          </Avatar>
                          <span>
                            {review.reviewer.first_name} {review.reviewer.last_name}
                          </span>
                        </div>
                      ) : (
                        <span>Sistema</span>
                      )}
                      <span>•</span>
                      <span>
                        {format(new Date(review.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};