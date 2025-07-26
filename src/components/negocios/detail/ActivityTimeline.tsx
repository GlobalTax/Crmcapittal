import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Clock, 
  Plus, 
  MessageSquare, 
  Phone, 
  Mail, 
  FileText, 
  Users, 
  Calendar,
  TrendingUp,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Negocio } from '@/types/Negocio';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Activity {
  id: string;
  negocio_id: string;
  activity_type: string;
  title: string;
  description?: string;
  activity_date: string;
  created_by: string;
  created_at: string;
  metadata?: any;
}

interface ActivityTimelineProps {
  negocio: Negocio;
}

const activityTypes = [
  { value: 'call', label: 'Llamada', icon: Phone, color: 'bg-blue-100 text-blue-800' },
  { value: 'email', label: 'Email', icon: Mail, color: 'bg-green-100 text-green-800' },
  { value: 'meeting', label: 'Reunión', icon: Users, color: 'bg-purple-100 text-purple-800' },
  { value: 'document', label: 'Documento', icon: FileText, color: 'bg-orange-100 text-orange-800' },
  { value: 'note', label: 'Nota', icon: MessageSquare, color: 'bg-gray-100 text-gray-800' },
  { value: 'milestone', label: 'Hito', icon: CheckCircle, color: 'bg-emerald-100 text-emerald-800' },
  { value: 'task', label: 'Tarea', icon: Calendar, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'update', label: 'Actualización', icon: TrendingUp, color: 'bg-indigo-100 text-indigo-800' }
];

export const ActivityTimeline = ({ negocio }: ActivityTimelineProps) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newActivity, setNewActivity] = useState({
    activity_type: '',
    title: '',
    description: '',
    activity_date: new Date().toISOString().split('T')[0]
  });
  const { toast } = useToast();

  const fetchActivities = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('negocio_activities')
        .select('*')
        .eq('negocio_id', negocio.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  }, [negocio.id]);

  const addActivity = async () => {
    if (!newActivity.activity_type || !newActivity.title) {
      toast({
        title: "Error",
        description: "Tipo de actividad y título son requeridos",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('negocio_activities')
        .insert([{
          negocio_id: negocio.id,
          activity_type: newActivity.activity_type,
          title: newActivity.title,
          description: newActivity.description || null,
          activity_date: newActivity.activity_date,
          created_by: user?.user?.id
        }]);

      if (error) throw error;

      await fetchActivities();
      setNewActivity({
        activity_type: '',
        title: '',
        description: '',
        activity_date: new Date().toISOString().split('T')[0]
      });
      setShowAddDialog(false);
      
      toast({
        title: "Actividad agregada",
        description: "La actividad se ha registrado correctamente",
      });
    } catch (error) {
      console.error('Error adding activity:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar la actividad",
        variant: "destructive",
      });
    }
  };

  const getActivityTypeConfig = (type: string) => {
    return activityTypes.find(t => t.value === type) || activityTypes[4]; // Default to note
  };

  useEffect(() => {
    fetchActivities();
  }, [negocio.id, fetchActivities]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timeline de Actividades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timeline de Actividades
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Actividad
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nueva Actividad</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="activity-type">Tipo de Actividad</Label>
                  <Select 
                    value={newActivity.activity_type} 
                    onValueChange={(value) => setNewActivity({ ...newActivity, activity_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {activityTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={newActivity.title}
                    onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                    placeholder="Título de la actividad"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={newActivity.description}
                    onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                    placeholder="Descripción opcional"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="activity-date">Fecha</Label>
                  <Input
                    id="activity-date"
                    type="date"
                    value={newActivity.activity_date}
                    onChange={(e) => setNewActivity({ ...newActivity, activity_date: e.target.value })}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={addActivity}>
                    Agregar Actividad
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity, index) => {
              const config = getActivityTypeConfig(activity.activity_type);
              const Icon = config.icon;
              
              return (
                <div key={activity.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`p-2 rounded-full ${config.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    {index < activities.length - 1 && (
                      <div className="h-8 w-px bg-border mt-2" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{activity.title}</h4>
                      <Badge variant="outline" className={`text-xs ${config.color}`}>
                        {config.label}
                      </Badge>
                    </div>
                    {activity.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {activity.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        {new Date(activity.activity_date).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      <span>
                        {new Date(activity.created_at).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium mb-2">No hay actividades registradas</h3>
            <p className="text-sm mb-4">Comienza a registrar actividades para hacer seguimiento del progreso</p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Primera Actividad
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};