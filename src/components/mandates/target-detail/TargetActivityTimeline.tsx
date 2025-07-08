import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Plus, 
  User, 
  Phone, 
  Mail, 
  FileText,
  TrendingUp,
  Brain,
  Shield,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { MandateTargetActivity, MandateTargetFollowup } from '@/types/BuyingMandate';

interface TargetActivityTimelineProps {
  activities: MandateTargetActivity[];
  followups: MandateTargetFollowup[];
  onAddActivity: (data: any) => void;
  onCompleteFollowup: (followupId: string) => void;
}

export const TargetActivityTimeline = ({ 
  activities, 
  followups, 
  onAddActivity,
  onCompleteFollowup 
}: TargetActivityTimelineProps) => {
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [newActivity, setNewActivity] = useState({
    activity_type: 'manual_note',
    title: '',
    description: '',
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'contact_made':
        return <Phone className="h-4 w-4 text-blue-600" />;
      case 'email_sent':
        return <Mail className="h-4 w-4 text-green-600" />;
      case 'status_change':
        return <TrendingUp className="h-4 w-4 text-purple-600" />;
      case 'document_shared':
        return <FileText className="h-4 w-4 text-orange-600" />;
      case 'einforma_enrichment':
        return <Brain className="h-4 w-4 text-blue-600" />;
      case 'nda_generated':
        return <Shield className="h-4 w-4 text-purple-600" />;
      case 'manual_note':
        return <User className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'contact_made':
        return 'bg-blue-100 text-blue-800';
      case 'email_sent':
        return 'bg-green-100 text-green-800';
      case 'status_change':
        return 'bg-purple-100 text-purple-800';
      case 'document_shared':
        return 'bg-orange-100 text-orange-800';
      case 'einforma_enrichment':
        return 'bg-blue-100 text-blue-800';
      case 'nda_generated':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddActivity = () => {
    if (newActivity.title.trim()) {
      onAddActivity(newActivity);
      setNewActivity({
        activity_type: 'manual_note',
        title: '',
        description: '',
      });
      setIsAddingActivity(false);
    }
  };

  // Combine and sort activities and followups
  const timelineItems = [
    ...activities.map(activity => ({
      type: 'activity' as const,
      id: activity.id,
      date: activity.created_at,
      data: activity,
    })),
    ...followups.map(followup => ({
      type: 'followup' as const,
      id: followup.id,
      date: followup.scheduled_date,
      data: followup,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      {/* Add Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Cronología de Actividades
            </div>
            <Dialog open={isAddingActivity} onOpenChange={setIsAddingActivity}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir Actividad
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nueva Actividad</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={newActivity.title}
                      onChange={(e) => setNewActivity(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ej: Llamada de seguimiento"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={newActivity.description}
                      onChange={(e) => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Detalles de la actividad..."
                      rows={3}
                    />
                  </div>

                  <Button onClick={handleAddActivity} className="w-full">
                    Registrar Actividad
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Timeline */}
      <div className="space-y-4">
        {timelineItems.length > 0 ? (
          timelineItems.map((item, index) => (
            <div key={item.id} className="relative">
              {/* Timeline Line */}
              {index < timelineItems.length - 1 && (
                <div className="absolute left-6 top-12 bottom-0 w-px bg-gray-200"></div>
              )}
              
              <div className="flex gap-4">
                {/* Icon */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  item.type === 'activity' 
                    ? 'bg-blue-100' 
                    : item.data.is_completed 
                      ? 'bg-green-100' 
                      : 'bg-yellow-100'
                }`}>
                  {item.type === 'activity' ? (
                    getActivityIcon(item.data.activity_type)
                  ) : item.data.is_completed ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{item.data.title}</h4>
                            {item.type === 'activity' && (
                              <Badge className={getActivityColor(item.data.activity_type)}>
                                {item.data.activity_type.replace('_', ' ')}
                              </Badge>
                            )}
                            {item.type === 'followup' && !item.data.is_completed && (
                              <Badge variant="outline">Recordatorio</Badge>
                            )}
                            {item.type === 'followup' && item.data.is_completed && (
                              <Badge className="bg-green-100 text-green-800">Completado</Badge>
                            )}
                          </div>
                          
                          {item.data.description && (
                            <p className="text-muted-foreground text-sm mb-3">
                              {item.data.description}
                            </p>
                          )}

                          {/* Activity Data */}
                          {item.type === 'activity' && item.data.activity_data && (
                            <div className="bg-gray-50 rounded p-3 text-sm">
                              {Object.entries(item.data.activity_data).map(([key, value]) => (
                                key !== 'automated' && (
                                  <div key={key} className="flex justify-between">
                                    <span className="capitalize">{key.replace('_', ' ')}:</span>
                                    <span className="font-medium">{String(value)}</span>
                                  </div>
                                )
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-3">
                            <div className="text-xs text-muted-foreground">
                              {new Date(item.date).toLocaleString('es-ES')}
                            </div>
                            
                            {item.type === 'followup' && !item.data.is_completed && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => onCompleteFollowup(item.data.id)}
                              >
                                Marcar como completado
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Clock className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="font-medium mb-2">Sin actividades registradas</h3>
              <p className="text-muted-foreground mb-6">
                Las actividades aparecerán aquí automáticamente conforme interactúes con el target
              </p>
              <Button onClick={() => setIsAddingActivity(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Registrar Primera Actividad
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};