import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  MessageSquare, 
  FileText, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Download,
  Filter,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useValoracionComments, ValoracionComment } from '@/hooks/useValoracionComments';
import { ValoracionCommentForm } from './ValoracionCommentForm';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ActivityEvent {
  id: string;
  type: 'comment' | 'document' | 'status' | 'phase';
  title: string;
  description: string;
  user_email: string;
  user_name: string;
  created_at: string;
  metadata: Record<string, any>;
  icon: React.ElementType;
  color: string;
}

interface ValoracionActivityPanelProps {
  valoracionId: string;
}

const eventTypeConfig = {
  note: { icon: MessageSquare, color: 'text-primary', label: 'Nota' },
  status_change: { icon: AlertCircle, color: 'text-amber-600', label: 'Cambio Estado' },
  phase_change: { icon: FileText, color: 'text-blue-600', label: 'Cambio Fase' },
  approval: { icon: CheckCircle, color: 'text-green-600', label: 'Aprobación' },
  rejection: { icon: XCircle, color: 'text-red-600', label: 'Rechazo' },
  document_update: { icon: FileText, color: 'text-purple-600', label: 'Documento' },
  assignment: { icon: Users, color: 'text-indigo-600', label: 'Asignación' }
};

export function ValoracionActivityPanel({ valoracionId }: ValoracionActivityPanelProps) {
  const { comments, loading: commentsLoading, addComment, loadComments } = useValoracionComments(valoracionId);
  const [documentReviews, setDocumentReviews] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const loadDocumentReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('valoracion_document_reviews' as any)
        .select(`
          *,
          document:valoracion_documents(file_name)
        `)
        .eq('document_id', valoracionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocumentReviews(data || []);
    } catch (error) {
      console.error('Error loading document reviews:', error);
    }
  };

  const combineActivities = () => {
    setLoadingActivities(true);
    const allActivities: ActivityEvent[] = [];

    // Add comments
    comments.forEach(comment => {
      const config = eventTypeConfig[comment.comment_type] || eventTypeConfig.note;
      allActivities.push({
        id: comment.id,
        type: 'comment',
        title: config.label,
        description: comment.comment_text,
        user_email: comment.user_email || 'Usuario desconocido',
        user_name: comment.user_name || 'Usuario',
        created_at: comment.created_at,
        metadata: comment.metadata,
        icon: config.icon,
        color: config.color
      });
    });

    // Add document reviews
    documentReviews.forEach(review => {
      allActivities.push({
        id: review.id,
        type: 'document',
        title: 'Revisión de Documento',
        description: `${review.document?.file_name || 'Documento'} - Estado: ${review.new_status}${review.review_notes ? ` - ${review.review_notes}` : ''}`,
        user_email: review.reviewer?.email || 'Sistema',
        user_name: review.reviewer?.email?.split('@')[0] || 'Sistema',
        created_at: review.created_at,
        metadata: { status: review.new_status, notes: review.review_notes },
        icon: FileText,
        color: review.new_status === 'approved' ? 'text-green-600' : review.new_status === 'rejected' ? 'text-red-600' : 'text-amber-600'
      });
    });

    // Sort by creation date (newest first)
    allActivities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Apply filter
    let filteredActivities = allActivities;
    if (filter !== 'all') {
      filteredActivities = allActivities.filter(activity => {
        if (filter === 'comments') return activity.type === 'comment';
        if (filter === 'documents') return activity.type === 'document';
        if (filter === 'status') return activity.type === 'comment' && ['status_change', 'phase_change'].includes(activity.metadata.comment_type);
        return true;
      });
    }

    setActivities(filteredActivities);
    setLoadingActivities(false);
  };

  const generateAuditPDF = async () => {
    setGeneratingPDF(true);
    try {
      // Import jsPDF dynamically
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // Header
      doc.setFontSize(20);
      doc.text('Historial de Auditoría - Valoración', 20, 30);
      
      doc.setFontSize(12);
      doc.text(`ID de Valoración: ${valoracionId}`, 20, 45);
      doc.text(`Fecha de Generación: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`, 20, 55);

      let yPosition = 75;

      // Activities
      doc.setFontSize(16);
      doc.text('Historial de Actividades', 20, yPosition);
      yPosition += 15;

      activities.forEach((activity, index) => {
        if (yPosition > 270) { // New page if needed
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(10);
        doc.text(`${index + 1}. ${activity.title}`, 20, yPosition);
        yPosition += 5;
        
        doc.setFontSize(8);
        doc.text(`Usuario: ${activity.user_email}`, 25, yPosition);
        yPosition += 4;
        
        doc.text(`Fecha: ${format(new Date(activity.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}`, 25, yPosition);
        yPosition += 4;
        
        // Description (with text wrapping)
        const lines = doc.splitTextToSize(activity.description, 150);
        doc.text(lines, 25, yPosition);
        yPosition += lines.length * 4 + 5;
      });

      // Save PDF
      doc.save(`auditoria-valoracion-${valoracionId}.pdf`);
      toast.success('PDF de auditoría generado correctamente');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Error al generar el PDF de auditoría');
    } finally {
      setGeneratingPDF(false);
    }
  };

  useEffect(() => {
    loadDocumentReviews();
  }, [valoracionId]);

  useEffect(() => {
    combineActivities();
  }, [comments, documentReviews, filter]);

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      <ValoracionCommentForm 
        onSubmit={addComment}
        loading={commentsLoading}
      />

      {/* Activity Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Historial de Actividades
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      {filter === 'all' && 'Todas las actividades'}
                      {filter === 'comments' && 'Comentarios'}
                      {filter === 'documents' && 'Documentos'}
                      {filter === 'status' && 'Cambios de Estado'}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las actividades</SelectItem>
                  <SelectItem value="comments">Comentarios</SelectItem>
                  <SelectItem value="documents">Documentos</SelectItem>
                  <SelectItem value="status">Cambios de Estado</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={generateAuditPDF}
                disabled={generatingPDF}
              >
                <Download className="h-4 w-4 mr-2" />
                {generatingPDF ? 'Generando...' : 'Exportar PDF'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            {loadingActivities ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay actividades para mostrar
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div key={activity.id}>
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-full bg-muted ${activity.color}`}>
                        <activity.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {activity.title}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {activity.user_name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            {format(new Date(activity.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                          </span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">
                          {activity.description}
                        </p>
                      </div>
                    </div>
                    {index < activities.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}