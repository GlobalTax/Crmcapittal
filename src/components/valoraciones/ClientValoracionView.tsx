
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FileText, Download, Building2, User, Calendar, ExternalLink } from 'lucide-react';
import { Valoracion } from '@/types/Valoracion';
import { VALORACION_PHASES } from '@/utils/valoracionPhases';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ValoracionDocument {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  content_type: string;
  document_type: 'deliverable' | 'internal';
  created_at: string;
}

export const ClientValoracionView = () => {
  const { token } = useParams<{ token: string }>();
  const [valoracion, setValoracion] = useState<Valoracion | null>(null);
  const [documents, setDocuments] = useState<ValoracionDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchValoracionByToken = async () => {
      if (!token) {
        setError('Token de acceso no válido');
        setLoading(false);
        return;
      }

      try {
        // Buscar valoración por token de cliente
        const { data: valoracionData, error: valoracionError } = await supabase
          .from('valoraciones')
          .select('*')
          .eq('client_access_token', token)
          .eq('status', 'delivered') // Solo valoraciones entregadas
          .single();

        if (valoracionError || !valoracionData) {
          setError('Valoración no encontrada o no está disponible');
          setLoading(false);
          return;
        }

        setValoracion(valoracionData as Valoracion);

        // Obtener solo documentos entregables
        const { data: documentsData, error: documentsError } = await supabase
          .from('valoracion_documents')
          .select('*')
          .eq('valoracion_id', valoracionData.id)
          .eq('document_type', 'deliverable')
          .order('created_at', { ascending: false });

        if (!documentsError && documentsData) {
          setDocuments(documentsData);
        }

      } catch (err) {
        console.error('Error fetching valoracion:', err);
        setError('Error al cargar la valoración');
      } finally {
        setLoading(false);
      }
    };

    fetchValoracionByToken();
  }, [token]);

  const downloadDocument = async (document: ValoracionDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('valoracion-documents')
        .download(document.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !valoracion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <ExternalLink className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Acceso no disponible</h2>
            <p className="text-muted-foreground">
              {error || 'La valoración no está disponible o el enlace ha caducado.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const phase = VALORACION_PHASES[valoracion.status];

  return (
    <div className="min-h-screen bg-background">
      {/* Header simplificado para cliente */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Valoración Empresarial</h1>
              <p className="text-muted-foreground">Informe de valoración completado</p>
            </div>
            <Badge className={`${phase.bgColor} ${phase.textColor} border-0`}>
              {phase.icon} {phase.label}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Información de la empresa */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Información de la Empresa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold">{valoracion.company_name}</h3>
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <User className="w-4 h-4" />
                  <span>Cliente: {valoracion.client_name}</span>
                </div>
                {valoracion.company_sector && (
                  <p className="text-muted-foreground mt-1">
                    Sector: {valoracion.company_sector}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Fecha de entrega: {format(new Date(valoracion.updated_at), 'dd MMMM yyyy', { locale: es })}
                  </span>
                </div>
              </div>
            </div>
            
            {valoracion.company_description && (
              <>
                <Separator className="my-4" />
                <div>
                  <h4 className="font-medium mb-2">Descripción</h4>
                  <p className="text-muted-foreground">{valoracion.company_description}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Documentos entregables */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Documentos de Valoración
            </CardTitle>
            <p className="text-muted-foreground">
              Documentos oficiales de la valoración empresarial
            </p>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No hay documentos disponibles para descarga
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((document) => (
                  <div 
                    key={document.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">{document.file_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(document.file_size / 1024 / 1024).toFixed(2)} MB • 
                          {format(new Date(document.created_at), 'dd MMM yyyy', { locale: es })}
                        </p>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => downloadDocument(document)}
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Descargar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t">
          <p className="text-sm text-muted-foreground">
            Este informe es confidencial y está destinado únicamente al cliente especificado.
          </p>
        </div>
      </div>
    </div>
  );
};
