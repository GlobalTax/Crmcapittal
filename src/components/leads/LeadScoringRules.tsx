import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Settings, Trash2 } from "lucide-react";
import { ActivityType } from "@/types/LeadNurturing";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/productionLogger';

interface LeadScoringRule {
  id: string;
  nombre: string;
  description?: string;
  condicion: {
    activity_type: ActivityType;
    criteria: Record<string, any>;
  };
  valor: number;
  activo: boolean;
  created_at: string;
}

export const LeadScoringRules = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<LeadScoringRule | null>(null);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    nombre: '',
    description: '',
    activity_type: 'EMAIL_OPENED' as ActivityType,
    valor: 5,
    activo: true
  });

  // Fetch scoring rules
  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['lead-scoring-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_scoring_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as any[];
    }
  });

  // Create/Update rule mutation
  const saveMutation = useMutation({
    mutationFn: async (ruleData: any) => {
      if (editingRule) {
        const { data, error } = await supabase
          .from('lead_scoring_rules')
          .update(ruleData)
          .eq('id', editingRule.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('lead_scoring_rules')
          .insert([ruleData])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-scoring-rules'] });
      toast.success(editingRule ? 'Regla actualizada' : 'Regla creada exitosamente');
      handleClose();
    },
    onError: (error) => {
      toast.error('Error al guardar la regla');
      logger.error('Error saving lead scoring rule', { error }, 'LeadScoringRules');
    }
  });

  // Delete rule mutation
  const deleteMutation = useMutation({
    mutationFn: async (ruleId: string) => {
      const { error } = await supabase
        .from('lead_scoring_rules')
        .delete()
        .eq('id', ruleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-scoring-rules'] });
      toast.success('Regla eliminada exitosamente');
    },
    onError: () => {
      toast.error('Error al eliminar la regla');
    }
  });

  const handleClose = () => {
    setIsOpen(false);
    setEditingRule(null);
    setFormData({
      nombre: '',
      description: '',
      activity_type: 'EMAIL_OPENED' as ActivityType,
      valor: 5,
      activo: true
    });
  };

  const handleEdit = (rule: any) => {
    setEditingRule(rule);
    setFormData({
      nombre: rule.nombre,
      description: rule.description || '',
      activity_type: rule.condicion.activity_type,
      valor: rule.valor,
      activo: rule.activo
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      nombre: formData.nombre,
      description: formData.description,
      condicion: {
        activity_type: formData.activity_type,
        criteria: {}
      },
      valor: formData.valor,
      activo: formData.activo
    });
  };

  const activityTypes = [
    { value: 'EMAIL_OPENED', label: 'Email Abierto' },
    { value: 'EMAIL_CLICKED', label: 'Email Clickeado' },
    { value: 'WEBSITE_VISIT', label: 'Visita al Sitio Web' },
    { value: 'FORM_SUBMITTED', label: 'Formulario Enviado' },
    { value: 'DOCUMENT_DOWNLOADED', label: 'Documento Descargado' },
    { value: 'CALL_MADE', label: 'Llamada Realizada' },
    { value: 'MEETING_SCHEDULED', label: 'Reunión Programada' }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Reglas de Scoring Automático
          </CardTitle>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Nueva Regla
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingRule ? 'Editar Regla' : 'Nueva Regla de Scoring'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Nombre</Label>
                  <Input
                    value={formData.nombre}
                    onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label>Descripción</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Actividad Trigger</Label>
                  <Select 
                    value={formData.activity_type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, activity_type: value as ActivityType }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {activityTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Puntos Otorgados</Label>
                  <Input
                    type="number"
                    value={formData.valor}
                    onChange={(e) => setFormData(prev => ({ ...prev, valor: parseInt(e.target.value) || 0 }))}
                    min="1"
                    max="100"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.activo}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, activo: checked }))}
                  />
                  <Label>Regla Activa</Label>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? 'Guardando...' : 'Guardar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Cargando reglas...</div>
        ) : rules.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay reglas de scoring configuradas</p>
            <p className="text-sm">Crea reglas para puntuar automáticamente a tus leads</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((rule: any) => (
              <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{rule.nombre}</h4>
                    <Badge variant={rule.activo ? "default" : "secondary"}>
                      {rule.activo ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </div>
                  {rule.description && (
                    <p className="text-sm text-muted-foreground mt-1">{rule.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>Trigger: {activityTypes.find(t => t.value === rule.condicion?.activity_type)?.label}</span>
                    <span>Puntos: +{rule.valor}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(rule)}>
                    Editar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => deleteMutation.mutate(rule.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};