import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Play, Settings, Mail, Bell, CheckSquare, AlertTriangle } from 'lucide-react';
import { Stage } from '@/types/Pipeline';
import { StageAction, ActionConfig, ActionType } from '@/types/StageAction';
import { useStageActions } from '@/hooks/useStageActions';
import { toast } from 'sonner';

interface PipelineStageActionsProps {
  stage: Stage;
  leadId?: string;
  context?: any;
}

interface ActionFormData {
  action_name: string;
  action_type: ActionType;
  action_config: ActionConfig;
  is_required: boolean;
  order_index: number;
}

export const PipelineStageActions = ({ stage, leadId, context }: PipelineStageActionsProps) => {
  const { actions, loading, createStageAction, executeAction } = useStageActions(stage.id);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionForm, setActionForm] = useState<ActionFormData>({
    action_name: '',
    action_type: 'manual',
    action_config: {},
    is_required: false,
    order_index: 0
  });

  const automaticActions = actions.filter(a => a.action_type === 'automatic');
  const manualActions = actions.filter(a => a.action_type === 'manual');
  const validationActions = actions.filter(a => a.action_type === 'validation');

  const handleExecuteAction = async (actionId: string) => {
    try {
      await executeAction(actionId, { leadId, ...context });
      toast.success('Acción ejecutada exitosamente');
    } catch (error) {
      console.error('Error executing action:', error);
    }
  };

  const handleCreateAction = async () => {
    try {
      await createStageAction({
        ...actionForm,
        stage_id: stage.id,
        is_active: true
      });
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating action:', error);
    }
  };

  const resetForm = () => {
    setActionForm({
      action_name: '',
      action_type: 'manual',
      action_config: {},
      is_required: false,
      order_index: actions.length
    });
  };

  const getActionIcon = (type: ActionType) => {
    switch (type) {
      case 'automatic': return <Settings className="h-4 w-4" />;
      case 'manual': return <Play className="h-4 w-4" />;
      case 'validation': return <CheckSquare className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getActionColor = (type: ActionType) => {
    switch (type) {
      case 'automatic': return 'default';
      case 'manual': return 'secondary';
      case 'validation': return 'outline';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Acciones de Etapa: {stage.name}</h3>
        <Button onClick={() => setIsDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Acción
        </Button>
      </div>

      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manual">
            Manuales ({manualActions.length})
          </TabsTrigger>
          <TabsTrigger value="automatic">
            Automáticas ({automaticActions.length})
          </TabsTrigger>
          <TabsTrigger value="validation">
            Validaciones ({validationActions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-3">
          {manualActions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay acciones manuales configuradas
            </div>
          ) : (
            manualActions.map((action) => (
              <ActionCard
                key={action.id}
                action={action}
                onExecute={() => handleExecuteAction(action.id)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="automatic" className="space-y-3">
          {automaticActions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay acciones automáticas configuradas
            </div>
          ) : (
            automaticActions.map((action) => (
              <ActionCard
                key={action.id}
                action={action}
                onExecute={() => handleExecuteAction(action.id)}
                isAutomatic
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="validation" className="space-y-3">
          {validationActions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay validaciones configuradas
            </div>
          ) : (
            validationActions.map((action) => (
              <ActionCard
                key={action.id}
                action={action}
                onExecute={() => handleExecuteAction(action.id)}
                isValidation
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Action Creation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nueva Acción</DialogTitle>
            <DialogDescription>
              Configura una nueva acción para la etapa {stage.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="action_name">Nombre de la Acción</Label>
                <Input
                  id="action_name"
                  value={actionForm.action_name}
                  onChange={(e) => setActionForm(prev => ({ ...prev, action_name: e.target.value }))}
                  placeholder="Ej: Enviar NDA"
                />
              </div>
              <div>
                <Label htmlFor="action_type">Tipo de Acción</Label>
                <Select
                  value={actionForm.action_type}
                  onValueChange={(value: ActionType) => setActionForm(prev => ({ ...prev, action_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="automatic">Automática</SelectItem>
                    <SelectItem value="validation">Validación</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_required"
                checked={actionForm.is_required}
                onCheckedChange={(checked) => setActionForm(prev => ({ ...prev, is_required: checked }))}
              />
              <Label htmlFor="is_required">Acción requerida</Label>
            </div>

            {/* Action Configuration */}
            <ActionConfigForm
              actionType={actionForm.action_type}
              config={actionForm.action_config}
              onChange={(config) => setActionForm(prev => ({ ...prev, action_config: config }))}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateAction}>
              Crear Acción
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface ActionCardProps {
  action: StageAction;
  onExecute: () => void;
  isAutomatic?: boolean;
  isValidation?: boolean;
}

const ActionCard = ({ action, onExecute, isAutomatic, isValidation }: ActionCardProps) => {
  const getActionIcon = () => {
    if (isAutomatic) return <Settings className="h-4 w-4" />;
    if (isValidation) return <CheckSquare className="h-4 w-4" />;
    return <Play className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getActionIcon()}
            <div>
              <h4 className="font-medium">{action.action_name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={
                  action.action_type === 'automatic' ? 'default' :
                  action.action_type === 'manual' ? 'secondary' : 'outline'
                }>
                  {action.action_type}
                </Badge>
                {action.is_required && (
                  <Badge variant="destructive">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Requerida
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {!isAutomatic && (
            <Button
              onClick={onExecute}
              variant="outline"
              size="sm"
            >
              {isValidation ? 'Validar' : 'Ejecutar'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface ActionConfigFormProps {
  actionType: ActionType;
  config: ActionConfig;
  onChange: (config: ActionConfig) => void;
}

const ActionConfigForm = ({ actionType, config, onChange }: ActionConfigFormProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  switch (actionType) {
    case 'manual':
      return (
        <div className="space-y-4">
          <div>
            <Label>Texto del Botón</Label>
            <Input
              value={config.button_text || ''}
              onChange={(e) => updateConfig('button_text', e.target.value)}
              placeholder="Ejecutar"
            />
          </div>
          <div>
            <Label>Mensaje de Confirmación</Label>
            <Textarea
              value={config.confirmation_message || ''}
              onChange={(e) => updateConfig('confirmation_message', e.target.value)}
              placeholder="¿Estás seguro de ejecutar esta acción?"
            />
          </div>
          <div>
            <Label>Mensaje de Éxito</Label>
            <Input
              value={config.success_message || ''}
              onChange={(e) => updateConfig('success_message', e.target.value)}
              placeholder="Acción ejecutada exitosamente"
            />
          </div>
        </div>
      );

    case 'automatic':
      return (
        <div className="space-y-4">
          <div>
            <Label>Tipo de Tarea</Label>
            <Select
              value={config.task_type || ''}
              onValueChange={(value) => updateConfig('task_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Enviar Email</SelectItem>
                <SelectItem value="notification">Crear Notificación</SelectItem>
                <SelectItem value="task">Crear Tarea</SelectItem>
                <SelectItem value="webhook">Llamar Webhook</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Descripción de la Tarea</Label>
            <Textarea
              value={config.task_description || ''}
              onChange={(e) => updateConfig('task_description', e.target.value)}
              placeholder="Descripción de la tarea automática"
            />
          </div>
          <div>
            <Label>Retraso (minutos)</Label>
            <Input
              type="number"
              value={config.delay_minutes || 0}
              onChange={(e) => updateConfig('delay_minutes', parseInt(e.target.value))}
              placeholder="0"
            />
          </div>
        </div>
      );

    case 'validation':
      return (
        <div className="space-y-4">
          <div>
            <Label>Campos Requeridos</Label>
            <Textarea
              value={config.required_fields?.join('\n') || ''}
              onChange={(e) => updateConfig('required_fields', e.target.value.split('\n').filter(f => f.trim()))}
              placeholder="nombre&#10;email&#10;telefono"
              rows={3}
            />
          </div>
          <div>
            <Label>Mensaje de Error</Label>
            <Input
              value={config.error_message || ''}
              onChange={(e) => updateConfig('error_message', e.target.value)}
              placeholder="Por favor completa todos los campos requeridos"
            />
          </div>
        </div>
      );

    default:
      return null;
  }
};