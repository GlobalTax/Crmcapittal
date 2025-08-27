import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus, StickyNote, User, Calendar, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Company } from '@/types/Company';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { logger } from '@/utils/productionLogger';

interface CompanyNotesSectionProps {
  company: Company;
}

interface CompanyNote {
  id: string;
  note: string;
  note_type: string;
  created_at: string;
  created_by: string;
}

export const CompanyNotesSection = ({ company }: CompanyNotesSectionProps) => {
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['company-notes', company.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_notes')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching company notes', { error, companyId: company.id }, 'CompanyNotesSection');
        throw error;
      }

      return data as CompanyNote[];
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: async (noteContent: string) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('company_notes')
        .insert({
          company_id: company.id,
          note: noteContent,
          note_type: 'general',
          created_by: userData.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-notes', company.id] });
      queryClient.invalidateQueries({ queryKey: ['company-activities', company.id] });
      setNewNoteContent('');
      setIsAddingNote(false);
      toast.success('Nota añadida correctamente');
    },
    onError: (error) => {
      logger.error('Error creating company note', { error, companyId: company.id }, 'CompanyNotesSection');
      toast.error('Error al añadir la nota');
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase
        .from('company_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-notes', company.id] });
      toast.success('Nota eliminada correctamente');
    },
    onError: (error) => {
      logger.error('Error deleting company note', { error, companyId: company.id }, 'CompanyNotesSection');
      toast.error('Error al eliminar la nota');
    },
  });

  const handleAddNote = () => {
    if (!newNoteContent.trim()) return;
    createNoteMutation.mutate(newNoteContent);
  };

  const handleDeleteNote = (noteId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta nota?')) {
      deleteNoteMutation.mutate(noteId);
    }
  };

  const getRelativeTime = (date: string) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: es
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (notes.length === 0 && !isAddingNote) {
    return (
      <EmptyState
        icon={StickyNote}
        title="Aún no hay notas"
        subtitle="Añade notas sobre esta empresa para hacer seguimiento de información importante"
        action={{
          label: "Añadir Nota",
          onClick: () => setIsAddingNote(true)
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          Notas de la Empresa ({notes.length})
        </h3>
        {!isAddingNote && (
          <Button onClick={() => setIsAddingNote(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Añadir Nota
          </Button>
        )}
      </div>

      {/* Add Note Form */}
      {isAddingNote && (
        <Card>
          <CardHeader className="pb-3">
            <h4 className="text-sm font-medium">Añadir Nueva Nota</h4>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder="Escribe tu nota sobre esta empresa..."
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleAddNote}
                disabled={createNoteMutation.isPending || !newNoteContent.trim()}
              >
                {createNoteMutation.isPending ? 'Guardando...' : 'Guardar Nota'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAddingNote(false);
                  setNewNoteContent('');
                }}
                disabled={createNoteMutation.isPending}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes List */}
      <div className="space-y-3">
        {notes.map((note) => (
          <Card key={note.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      Usuario
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{getRelativeTime(note.created_at)}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNote(note.id)}
                        disabled={deleteNoteMutation.isPending}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {note.note}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};