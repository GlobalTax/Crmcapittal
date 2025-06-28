
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Play, Pause, Clock, DollarSign } from 'lucide-react';
import { useTimeTracking } from '@/hooks/useTimeTracking';

interface TimeTrackerProps {
  contactId?: string;
  operationId?: string;
  compact?: boolean;
}

export const TimeTracker = ({ contactId, operationId, compact = false }: TimeTrackerProps) => {
  const { activeTimer, startTimer, stopTimer, loading } = useTimeTracking();
  const [description, setDescription] = useState('');
  const [activityType, setActivityType] = useState('general');
  const [elapsedTime, setElapsedTime] = useState(0);

  // Update elapsed time every second for active timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeTimer) {
      interval = setInterval(() => {
        const start = new Date(activeTimer.start_time).getTime();
        const now = new Date().getTime();
        setElapsedTime(Math.floor((now - start) / 1000));
      }, 1000);
    } else {
      setElapsedTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTimer]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartStop = async () => {
    if (activeTimer) {
      await stopTimer();
      setDescription('');
      setActivityType('general');
    } else {
      await startTimer(contactId, operationId, activityType, description);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
        <Clock className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-mono">
          {activeTimer ? formatTime(elapsedTime) : '00:00:00'}
        </span>
        <Button
          size="sm"
          variant={activeTimer ? "destructive" : "default"}
          onClick={handleStartStop}
          disabled={loading}
        >
          {activeTimer ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Time Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-mono font-bold text-blue-600 mb-2">
            {formatTime(elapsedTime)}
          </div>
          <div className="text-sm text-gray-600">
            {activeTimer ? 'Tiempo transcurrido' : 'Listo para iniciar'}
          </div>
        </div>

        {!activeTimer && (
          <>
            <div className="space-y-2">
              <Label htmlFor="activity-type">Tipo de Actividad</Label>
              <Select value={activityType} onValueChange={setActivityType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="call">Llamada</SelectItem>
                  <SelectItem value="meeting">Reunión</SelectItem>
                  <SelectItem value="research">Investigación</SelectItem>
                  <SelectItem value="documentation">Documentación</SelectItem>
                  <SelectItem value="due_diligence">Due Diligence</SelectItem>
                  <SelectItem value="valuation">Valuación</SelectItem>
                  <SelectItem value="negotiation">Negociación</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="¿En qué vas a trabajar?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
          </>
        )}

        <Button
          className="w-full"
          size="lg"
          variant={activeTimer ? "destructive" : "default"}
          onClick={handleStartStop}
          disabled={loading}
        >
          {activeTimer ? (
            <>
              <Pause className="h-4 w-4 mr-2" />
              Detener Timer
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Iniciar Timer
            </>
          )}
        </Button>

        {activeTimer && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900">
              Actividad: {activeTimer.activity_type}
            </p>
            {activeTimer.description && (
              <p className="text-sm text-blue-700 mt-1">
                {activeTimer.description}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
