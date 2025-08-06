import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Clock, Play, Pause, Square } from 'lucide-react';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PersonalTimerProps {
  className?: string;
}

export const PersonalTimer = ({ className }: PersonalTimerProps) => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [description, setDescription] = useState('');
  const [entityType, setEntityType] = useState<'general' | 'lead' | 'transaccion' | 'valoracion'>('general');
  const [entityId, setEntityId] = useState<string>('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { user } = useAuth();
  const { createTimeEntry, timeEntries, isCreating } = useTimeEntries();

  // Fetch leads
  const { data: leads = [] } = useQuery({
    queryKey: ['leads-for-timer'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('leads')
        .select('id, name, company_name')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Fetch transacciones
  const { data: transacciones = [] } = useQuery({
    queryKey: ['transacciones-for-timer'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('transacciones')
        .select('id, nombre_transaccion, company:companies(name)')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Fetch valoraciones
  const { data: valoraciones = [] } = useQuery({
    queryKey: ['valoraciones-for-timer'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('valoraciones')
        .select('id, company_name, client_name')
        .eq('assigned_to', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Check if there's an active timer from database
  const activeEntry = timeEntries.find(entry => !entry.end_time);

  useEffect(() => {
    if (activeEntry && !isRunning) {
      // Resume from database timer
      const start = new Date(activeEntry.start_time);
      const elapsed = Math.floor((Date.now() - start.getTime()) / 1000);
      setSeconds(elapsed);
      setStartTime(start);
      setIsRunning(true);
    }
  }, [activeEntry, isRunning]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    if (activeEntry) {
      // Resume existing timer
      setIsRunning(true);
      return;
    }

    // Validation
    if (!description.trim()) {
      toast.error('Agrega una descripción antes de iniciar');
      return;
    }

    // Start new timer
    const now = new Date();
    setStartTime(now);
    setSeconds(0);
    setIsRunning(true);

    try {
      const timeEntryData: any = {
        activity_type: entityType,
        description: description.trim(),
        start_time: now.toISOString(),
        is_billable: entityType !== 'general'
      };

      // Add entity-specific IDs
      if (entityType === 'lead' && entityId) {
        timeEntryData.lead_id = entityId;
      } else if (entityType === 'transaccion' && entityId) {
        timeEntryData.operation_id = entityId;
      } else if (entityType === 'valoracion' && entityId) {
        // Note: valoraciones don't have a direct field in time_entries
        // We'll use the description to include valoracion info
        timeEntryData.description = `${description} (Valoración: ${valoraciones.find(v => v.id === entityId)?.company_name})`;
      }

      await createTimeEntry(timeEntryData);
    } catch (error) {
      console.error('Error starting timer:', error);
      setIsRunning(false);
      toast.error('Error al iniciar el timer');
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = async () => {
    if (!activeEntry || !startTime) {
      setIsRunning(false);
      setSeconds(0);
      setStartTime(null);
      return;
    }

    setIsRunning(false);
    const duration = Math.floor(seconds / 60); // Convert to minutes

    try {
      // Update the active entry with end time
      const { error } = await supabase
        .from('time_entries')
        .update({
          end_time: new Date().toISOString(),
          duration_minutes: duration
        })
        .eq('id', activeEntry.id);

      if (error) throw error;

      setSeconds(0);
      setStartTime(null);
      setDescription('');
      setEntityType('general');
      setEntityId('');
      toast.success(`Timer parado. Registrados ${duration} minutos`);
    } catch (error) {
      console.error('Error stopping timer:', error);
      toast.error('Error al parar el timer');
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}m`;
    }
    return `${seconds}s`;
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Timer Personal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timer Display */}
        <div className="text-center">
          <div className="text-3xl font-mono font-bold text-foreground mb-2">
            {formatTime(seconds)}
          </div>
          <div className="text-sm text-muted-foreground">
            {formatDuration(seconds)} registrados
          </div>
        </div>

        {/* Timer Status */}
        <div className="flex items-center justify-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
          <span className="text-sm text-muted-foreground">
            {isRunning ? 'En curso' : 'Detenido'}
          </span>
        </div>

        {/* Configuration */}
        {!isRunning && !activeEntry && (
          <div className="space-y-3 pt-3 border-t">
            <div className="space-y-2">
              <Label htmlFor="entity-type" className="text-xs">Asignar tiempo a:</Label>
              <Select value={entityType} onValueChange={(value: any) => {
                setEntityType(value);
                setEntityId('');
              }}>
                <SelectTrigger id="entity-type" className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Trabajo general</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="transaccion">Transacción</SelectItem>
                  <SelectItem value="valoracion">Valoración</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {entityType !== 'general' && (
              <div className="space-y-2">
                <Label htmlFor="entity-select" className="text-xs">
                  Seleccionar {entityType}:
                </Label>
                <Select value={entityId} onValueChange={setEntityId}>
                  <SelectTrigger id="entity-select" className="h-8">
                    <SelectValue placeholder={`Elegir ${entityType}...`} />
                  </SelectTrigger>
                  <SelectContent>
                    {entityType === 'lead' && leads.map((lead) => (
                      <SelectItem key={lead.id} value={lead.id}>
                        {lead.name} {lead.company_name && `(${lead.company_name})`}
                      </SelectItem>
                    ))}
                    {entityType === 'transaccion' && transacciones.map((transaccion) => (
                      <SelectItem key={transaccion.id} value={transaccion.id}>
                        {transaccion.nombre_transaccion}
                      </SelectItem>
                    ))}
                    {entityType === 'valoracion' && valoraciones.map((valoracion) => (
                      <SelectItem key={valoracion.id} value={valoracion.id}>
                        {valoracion.company_name} - {valoracion.client_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs">Descripción:</Label>
              <Textarea
                id="description"
                placeholder="¿En qué vas a trabajar?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="resize-none h-16 text-sm"
              />
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-2">
          {!isRunning ? (
            <Button 
              onClick={handleStart} 
              className="flex-1"
              disabled={isCreating}
            >
              <Play className="h-4 w-4 mr-2" />
              {activeEntry ? 'Reanudar' : 'Iniciar'}
            </Button>
          ) : (
            <Button 
              onClick={handlePause} 
              variant="outline" 
              className="flex-1"
            >
              <Pause className="h-4 w-4 mr-2" />
              Pausar
            </Button>
          )}
          
          <Button 
            onClick={handleStop} 
            variant="destructive" 
            size="sm"
            disabled={!isRunning && !activeEntry}
          >
            <Square className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Stats */}
        {activeEntry && (
          <div className="pt-3 border-t">
            <div className="text-xs text-muted-foreground text-center">
              Iniciado: {new Date(activeEntry.start_time).toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};