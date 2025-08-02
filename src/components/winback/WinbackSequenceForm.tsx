import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, X, ArrowLeft } from 'lucide-react';
import { useWinbackSequences, WinbackStep } from '@/hooks/useWinbackSequences';
import { Badge } from '@/components/ui/badge';

interface WinbackSequenceFormProps {
  sequence?: any;
  onClose: () => void;
}

export const WinbackSequenceForm = ({ sequence, onClose }: WinbackSequenceFormProps) => {
  const { createSequence, updateSequence } = useWinbackSequences();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: sequence?.nombre || '',
    descripcion: sequence?.descripcion || '',
    lost_reason_trigger: sequence?.lost_reason_trigger || '',
    activo: sequence?.activo ?? true,
    pasos: sequence?.pasos || []
  });

  const [newStep, setNewStep] = useState<Partial<WinbackStep>>({
    dias: 0,
    canal: 'email',
    asunto: '',
    prioridad: 'medium'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (sequence) {
        await updateSequence(sequence.id, formData);
      } else {
        await createSequence(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving sequence:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addStep = () => {
    if (newStep.canal && (newStep.asunto || newStep.script || newStep.mensaje)) {
      setFormData(prev => ({
        ...prev,
        pasos: [...prev.pasos, { ...newStep }]
      }));
      setNewStep({
        dias: 0,
        canal: 'email',
        asunto: '',
        prioridad: 'medium'
      });
    }
  };

  const removeStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      pasos: prev.pasos.filter((_, i) => i !== index)
    }));
  };

  const getChannelBadgeColor = (canal: string) => {
    switch (canal) {
      case 'email': return 'bg-blue-500';
      case 'call': return 'bg-green-500';
      case 'linkedin': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onClose}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold">
          {sequence ? 'Editar Secuencia' : 'Nueva Secuencia'} Winback
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nombre">Nombre de la Secuencia</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="Ej: Secuencia Precio"
                required
              />
            </div>

            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Describe cuándo y cómo usar esta secuencia"
              />
            </div>

            <div>
              <Label htmlFor="trigger">Trigger Automático (Motivo de Pérdida)</Label>
              <Select
                value={formData.lost_reason_trigger}
                onValueChange={(value) => setFormData(prev => ({ ...prev, lost_reason_trigger: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un motivo de pérdida" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin trigger automático</SelectItem>
                  <SelectItem value="precio">Precio</SelectItem>
                  <SelectItem value="timing">Timing</SelectItem>
                  <SelectItem value="sin respuesta">Sin respuesta</SelectItem>
                  <SelectItem value="presupuesto">Presupuesto</SelectItem>
                  <SelectItem value="competencia">Competencia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="activo"
                checked={formData.activo}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, activo: checked }))}
              />
              <Label htmlFor="activo">Secuencia activa</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pasos de la Secuencia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing steps */}
            <div className="space-y-2">
              {formData.pasos.map((paso: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                    Día {paso.dias}
                  </span>
                  <Badge className={`${getChannelBadgeColor(paso.canal)} text-white`}>
                    {paso.canal}
                  </Badge>
                  <span className="text-sm flex-1">
                    {paso.asunto || paso.script || paso.mensaje}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeStep(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Add new step */}
            <div className="border-t pt-4 space-y-3">
              <h4 className="font-medium">Añadir Nuevo Paso</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Días después</Label>
                  <Input
                    type="number"
                    min="0"
                    value={newStep.dias}
                    onChange={(e) => setNewStep(prev => ({ ...prev, dias: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Canal</Label>
                  <Select
                    value={newStep.canal}
                    onValueChange={(value) => setNewStep(prev => ({ ...prev, canal: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="call">Llamada</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {newStep.canal === 'email' && (
                <div>
                  <Label>Asunto del Email</Label>
                  <Input
                    value={newStep.asunto || ''}
                    onChange={(e) => setNewStep(prev => ({ ...prev, asunto: e.target.value }))}
                    placeholder="Asunto del email"
                  />
                </div>
              )}

              {newStep.canal === 'call' && (
                <div>
                  <Label>Script de Llamada</Label>
                  <Textarea
                    value={newStep.script || ''}
                    onChange={(e) => setNewStep(prev => ({ ...prev, script: e.target.value }))}
                    placeholder="Puntos clave para la llamada"
                  />
                </div>
              )}

              {(newStep.canal === 'linkedin' || newStep.canal === 'whatsapp') && (
                <div>
                  <Label>Mensaje</Label>
                  <Textarea
                    value={newStep.mensaje || ''}
                    onChange={(e) => setNewStep(prev => ({ ...prev, mensaje: e.target.value }))}
                    placeholder="Mensaje a enviar"
                  />
                </div>
              )}

              <div>
                <Label>Prioridad</Label>
                <Select
                  value={newStep.prioridad}
                  onValueChange={(value) => setNewStep(prev => ({ ...prev, prioridad: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="button" onClick={addStep} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Añadir Paso
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : (sequence ? 'Actualizar' : 'Crear')} Secuencia
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};
