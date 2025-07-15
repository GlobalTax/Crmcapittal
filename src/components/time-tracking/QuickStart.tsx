import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, Play, Zap, User, Phone, FileText, Search, Calendar, Building2 } from 'lucide-react';
import { useTimeTracking } from '@/hooks/useTimeTracking';

interface QuickStartProps {
  onTimerStarted?: () => void;
}

export const QuickStart = ({ onTimerStarted }: QuickStartProps) => {
  const today = new Date().toISOString().split('T')[0];
  const { startTimer, isTimerRunning, isStartingTimer } = useTimeTracking(today);
  
  const [description, setDescription] = useState('');
  const [selectedActivity, setSelectedActivity] = useState('general');
  const [isBillable, setIsBillable] = useState(true);

  const quickActivities = [
    { id: 'meeting', label: 'Reunión', icon: User, color: 'bg-blue-500' },
    { id: 'call', label: 'Llamada', icon: Phone, color: 'bg-green-500' },
    { id: 'research', label: 'Investigación', icon: Search, color: 'bg-purple-500' },
    { id: 'documentation', label: 'Documentación', icon: FileText, color: 'bg-orange-500' },
    { id: 'development', label: 'Desarrollo', icon: Building2, color: 'bg-indigo-500' },
    { id: 'general', label: 'General', icon: Calendar, color: 'bg-gray-500' },
  ];

  const handleQuickStart = async (activityType: string) => {
    try {
      await startTimer(undefined, activityType, description || `${activityType} - ${new Date().toLocaleTimeString()}`);
      setDescription('');
      onTimerStarted?.();
    } catch (error) {
      console.error('Error starting quick timer:', error);
    }
  };

  const handleCustomStart = async () => {
    if (!selectedActivity) return;
    
    try {
      await startTimer(undefined, selectedActivity, description);
      setDescription('');
      onTimerStarted?.();
    } catch (error) {
      console.error('Error starting custom timer:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Start Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Inicio Rápido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {quickActivities.map((activity) => {
              const Icon = activity.icon;
              return (
                <Button
                  key={activity.id}
                  variant="outline"
                  onClick={() => handleQuickStart(activity.id)}
                  disabled={isTimerRunning || isStartingTimer}
                  className="h-16 flex-col gap-2 p-3"
                >
                  <div className={`w-8 h-8 rounded-full ${activity.color} flex items-center justify-center`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">{activity.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Custom Timer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timer Personalizado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Actividad</label>
              <Select value={selectedActivity} onValueChange={setSelectedActivity}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar actividad" />
                </SelectTrigger>
                <SelectContent>
                  {quickActivities.map((activity) => (
                    <SelectItem key={activity.id} value={activity.id}>
                      <div className="flex items-center gap-2">
                        <activity.icon className="h-4 w-4" />
                        {activity.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción</label>
              <Input
                placeholder="Describe la actividad..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isTimerRunning) {
                    handleCustomStart();
                  }
                }}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="billable"
              checked={isBillable}
              onCheckedChange={(checked) => setIsBillable(!!checked)}
            />
            <label htmlFor="billable" className="text-sm font-medium">
              Tiempo facturable
            </label>
          </div>

          <Button
            onClick={handleCustomStart}
            disabled={isTimerRunning || isStartingTimer || !selectedActivity}
            className="w-full"
            size="lg"
          >
            {isStartingTimer ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Iniciar Timer
          </Button>
          
          {isTimerRunning && (
            <div className="text-center py-2">
              <Badge variant="secondary" className="gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Timer en curso
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};