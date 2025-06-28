
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTimeTracking } from '@/hooks/useTimeTracking';

interface TimeGoalsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TimeGoalsDialog = ({ open, onOpenChange }: TimeGoalsDialogProps) => {
  const { createTimeGoal } = useTimeTracking();
  const [goalType, setGoalType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [targetHours, setTargetHours] = useState('');
  const [activityType, setActivityType] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createTimeGoal({
      goal_type: goalType,
      target_hours: parseFloat(targetHours),
      activity_type: activityType || undefined,
      is_active: true,
    });

    // Reset form
    setGoalType('daily');
    setTargetHours('');
    setActivityType('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Objetivo de Tiempo</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goal-type">Tipo de Objetivo</Label>
            <Select value={goalType} onValueChange={(value) => setGoalType(value as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Diario</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-hours">Horas Objetivo</Label>
            <Input
              id="target-hours"
              type="number"
              step="0.5"
              min="0"
              value={targetHours}
              onChange={(e) => setTargetHours(e.target.value)}
              placeholder="8"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity-type">Tipo de Actividad (Opcional)</Label>
            <Select value={activityType} onValueChange={setActivityType}>
              <SelectTrigger>
                <SelectValue placeholder="Todas las actividades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas las actividades</SelectItem>
                <SelectItem value="call">Llamadas</SelectItem>
                <SelectItem value="meeting">Reuniones</SelectItem>
                <SelectItem value="research">Investigación</SelectItem>
                <SelectItem value="documentation">Documentación</SelectItem>
                <SelectItem value="due_diligence">Due Diligence</SelectItem>
                <SelectItem value="valuation">Valuación</SelectItem>
                <SelectItem value="negotiation">Negociación</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Crear Objetivo
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
