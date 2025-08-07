import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Bot, Plus, Edit, Trash2, Clock, Zap, Play, Pause } from 'lucide-react';
import { useAutomationRules, AutomationRule } from '@/hooks/useAutomationSystem';

export const AutomationRulesManager: React.FC = () => {
  const {
    rules,
    isLoading,
    createRule,
    updateRule,
    toggleRule,
    isCreating,
    isUpdating,
    isToggling
  } = useAutomationRules();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger_type: 'time_based' as AutomationRule['trigger_type'],
    trigger_config: {},
    conditions: [],
    actions: [],
    enabled: true,
    priority: 0
  });

  const handleOpenDialog = (rule?: AutomationRule) => {
    if (rule) {
      setSelectedRule(rule);
      setFormData({
        name: rule.name,
        description: rule.description || '',
        trigger_type: rule.trigger_type,
        trigger_config: rule.trigger_config,
        conditions: rule.conditions,
        actions: rule.actions,
        enabled: rule.enabled,
        priority: rule.priority
      });
    } else {
      setSelectedRule(null);
      setFormData({
        name: '',
        description: '',
        trigger_type: 'time_based',
        trigger_config: {},
        conditions: [],
        actions: [],
        enabled: true,
        priority: 0
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedRule) {
      updateRule({
        id: selectedRule.id,
        updates: formData
      });
    } else {
      createRule(formData);
    }
    
    setIsDialogOpen(false);
  };

  const handleToggleRule = (rule: AutomationRule) => {
    toggleRule({
      id: rule.id,
      enabled: !rule.enabled
    });
  };

  const getTriggerIcon = (type: AutomationRule['trigger_type']) => {
    const icons = {
      proposal_sent: Zap,
      proposal_viewed: Zap,
      no_response: Clock,
      time_based: Clock,
      manual: Play
    };
    return icons[type] || Bot;
  };

  const getTriggerLabel = (type: AutomationRule['trigger_type']) => {
    const labels = {
      proposal_sent: 'Propuesta Enviada',
      proposal_viewed: 'Propuesta Vista',
      no_response: 'Sin Respuesta',
      time_based: 'Basado en Tiempo',
      manual: 'Manual'
    };
    return labels[type];
  };

  const getTriggerColor = (type: AutomationRule['trigger_type']) => {
    const colors = {
      proposal_sent: 'bg-green-500',
      proposal_viewed: 'bg-blue-500',
      no_response: 'bg-orange-500',
      time_based: 'bg-purple-500',
      manual: 'bg-gray-500'
    };
    return colors[type];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Reglas de Automatización</h2>
          <p className="text-muted-foreground">
            Configura reglas para automatizar seguimientos y comunicaciones
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Regla
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rules.map((rule) => {
          const TriggerIcon = getTriggerIcon(rule.trigger_type);
          
          return (
            <Card key={rule.id} className={`relative ${!rule.enabled ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">{rule.name}</CardTitle>
                    <Badge 
                      variant="secondary" 
                      className={`${getTriggerColor(rule.trigger_type)} text-white`}
                    >
                      <TriggerIcon className="h-3 w-3 mr-1" />
                      {getTriggerLabel(rule.trigger_type)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Prioridad {rule.priority}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleRule(rule)}
                      disabled={isToggling}
                    >
                      {rule.enabled ? (
                        <Pause className="h-4 w-4 text-orange-500" />
                      ) : (
                        <Play className="h-4 w-4 text-green-500" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {rule.description && (
                  <p className="text-sm text-muted-foreground">{rule.description}</p>
                )}

                <div>
                  <p className="text-sm font-medium mb-1">Configuración:</p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    {rule.trigger_type === 'time_based' && rule.trigger_config.delay_days && (
                      <p>• Ejecutar después de {rule.trigger_config.delay_days} días</p>
                    )}
                    {rule.trigger_type === 'time_based' && rule.trigger_config.before_deadline_days && (
                      <p>• Ejecutar {rule.trigger_config.before_deadline_days} días antes del deadline</p>
                    )}
                    {rule.conditions.length > 0 && (
                      <p>• {rule.conditions.length} condición(es) configurada(s)</p>
                    )}
                    {rule.actions.length > 0 && (
                      <p>• {rule.actions.length} acción(es) configurada(s)</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(rule)}
                    className="flex-1"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={() => handleToggleRule(rule)}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dialog para crear/editar regla */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedRule ? 'Editar Regla' : 'Nueva Regla'}
            </DialogTitle>
            <DialogDescription>
              {selectedRule 
                ? 'Modifica los parámetros de la regla de automatización'
                : 'Crea una nueva regla para automatizar procesos'
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Seguimiento automático 7 días"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Prioridad</Label>
                <Input
                  id="priority"
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe qué hace esta regla..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trigger_type">Tipo de Disparador</Label>
              <Select
                value={formData.trigger_type}
                onValueChange={(value: AutomationRule['trigger_type']) =>
                  setFormData(prev => ({ ...prev, trigger_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="proposal_sent">Propuesta Enviada</SelectItem>
                  <SelectItem value="proposal_viewed">Propuesta Vista</SelectItem>
                  <SelectItem value="no_response">Sin Respuesta</SelectItem>
                  <SelectItem value="time_based">Basado en Tiempo</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.trigger_type === 'time_based' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Configuración de Tiempo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="delay_days">Días de Retraso</Label>
                      <Input
                        id="delay_days"
                        type="number"
                        value={(formData.trigger_config as any)?.delay_days || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          trigger_config: {
                            ...prev.trigger_config,
                            delay_days: parseInt(e.target.value) || 0
                          }
                        }))}
                        placeholder="7"
                        min="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="before_deadline_days">Días Antes del Deadline</Label>
                      <Input
                        id="before_deadline_days"
                        type="number"
                        value={(formData.trigger_config as any)?.before_deadline_days || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          trigger_config: {
                            ...prev.trigger_config,
                            before_deadline_days: parseInt(e.target.value) || 0
                          }
                        }))}
                        placeholder="3"
                        min="0"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Separator />

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enabled"
                  checked={formData.enabled}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, enabled: checked }))
                  }
                />
                <Label htmlFor="enabled">Regla activa</Label>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isCreating || isUpdating}>
                  {selectedRule ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};