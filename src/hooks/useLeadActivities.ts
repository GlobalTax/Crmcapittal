import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LeadActivity {
  id: string;
  lead_id: string;
  activity_type: string;
  title: string;
  description: string | null;
  activity_data: any;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useLeadActivities = (leadId: string) => {
  const { data: activities = [], isLoading, error, refetch } = useQuery({
    queryKey: ['lead-activities', leadId],
    queryFn: async () => {
      // First get activities from lead_notes, lead_tasks, and lead_files
      const [notesResult, tasksResult, filesResult] = await Promise.all([
        supabase
          .from('lead_notes')
          .select('*')
          .eq('lead_id', leadId)
          .order('created_at', { ascending: false }),
        supabase
          .from('lead_tasks')
          .select('*')
          .eq('lead_id', leadId)
          .order('created_at', { ascending: false }),
        supabase
          .from('lead_files')
          .select('*')
          .eq('lead_id', leadId)
          .order('created_at', { ascending: false })
      ]);

      if (notesResult.error) throw notesResult.error;
      if (tasksResult.error) throw tasksResult.error;
      if (filesResult.error) throw filesResult.error;

      // Transform all data into a unified activity format
      const activities: LeadActivity[] = [];

      // Add note activities
      notesResult.data?.forEach(note => {
        activities.push({
          id: `note-${note.id}`,
          lead_id: note.lead_id,
          activity_type: 'note_created',
          title: 'Nota añadida',
          description: note.note.length > 100 ? `${note.note.substring(0, 100)}...` : note.note,
          activity_data: { note_type: note.note_type, full_note: note.note },
          created_by: note.created_by,
          created_at: note.created_at,
          updated_at: note.updated_at,
        });
      });

      // Add task activities
      tasksResult.data?.forEach(task => {
        activities.push({
          id: `task-${task.id}`,
          lead_id: task.lead_id,
          activity_type: task.status === 'completed' ? 'task_completed' : 'task_created',
          title: task.status === 'completed' ? 'Tarea completada' : 'Tarea creada',
          description: task.title,
          activity_data: { 
            priority: task.priority, 
            status: task.status, 
            due_date: task.due_date,
            completed_at: task.completed_at 
          },
          created_by: task.created_by,
          created_at: task.status === 'completed' && task.completed_at ? task.completed_at : task.created_at,
          updated_at: task.updated_at,
        });
      });

      // Add file activities
      filesResult.data?.forEach(file => {
        activities.push({
          id: `file-${file.id}`,
          lead_id: file.lead_id,
          activity_type: 'file_uploaded',
          title: 'Archivo subido',
          description: file.file_name,
          activity_data: { 
            file_size: file.file_size, 
            content_type: file.content_type,
            file_url: file.file_url 
          },
          created_by: file.uploaded_by,
          created_at: file.created_at,
          updated_at: file.updated_at,
        });
      });

      // Sort by creation date (most recent first)
      return activities.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    enabled: !!leadId,
  });

  return {
    activities,
    isLoading,
    error,
    refetch,
  };
};