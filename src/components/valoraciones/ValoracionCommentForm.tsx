import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, FileText, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ValoracionComment } from '@/hooks/useValoracionComments';

interface ValoracionCommentFormProps {
  onSubmit: (comment: {
    comment_text: string;
    comment_type: ValoracionComment['comment_type'];
    metadata?: Record<string, any>;
  }) => Promise<void>;
  loading?: boolean;
}

const commentTypes = [
  { value: 'note', label: 'Nota General', icon: MessageSquare, color: 'text-primary' },
  { value: 'status_change', label: 'Cambio de Estado', icon: AlertCircle, color: 'text-amber-600' },
  { value: 'phase_change', label: 'Cambio de Fase', icon: FileText, color: 'text-blue-600' },
  { value: 'approval', label: 'Aprobación', icon: CheckCircle, color: 'text-green-600' },
  { value: 'rejection', label: 'Rechazo', icon: XCircle, color: 'text-red-600' },
  { value: 'document_update', label: 'Actualización de Documento', icon: FileText, color: 'text-purple-600' },
  { value: 'assignment', label: 'Asignación', icon: Users, color: 'text-indigo-600' }
] as const;

export function ValoracionCommentForm({ onSubmit, loading }: ValoracionCommentFormProps) {
  const [commentText, setCommentText] = useState('');
  const [commentType, setCommentType] = useState<ValoracionComment['comment_type']>('note');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        comment_text: commentText.trim(),
        comment_type: commentType
      });
      
      setCommentText('');
      setCommentType('note');
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setSubmitting(false);
    }
  };

  const selectedType = commentTypes.find(type => type.value === commentType);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Añadir Comentario
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="comment-type" className="text-sm font-medium mb-2 block">
              Tipo de Comentario
            </label>
            <Select value={commentType} onValueChange={(value) => setCommentType(value as ValoracionComment['comment_type'])}>
              <SelectTrigger>
                <SelectValue>
                  {selectedType && (
                    <div className="flex items-center gap-2">
                      <selectedType.icon className={`h-4 w-4 ${selectedType.color}`} />
                      <span>{selectedType.label}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {commentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className={`h-4 w-4 ${type.color}`} />
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="comment-text" className="text-sm font-medium mb-2 block">
              Comentario
            </label>
            <Textarea
              id="comment-text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Escribe tu comentario aquí..."
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={!commentText.trim() || submitting || loading}
              className="min-w-[120px]"
            >
              {submitting ? 'Añadiendo...' : 'Añadir Comentario'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}