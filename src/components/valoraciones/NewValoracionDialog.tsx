import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useValoraciones } from '@/hooks/useValoraciones';
import { useToast } from '@/hooks/use-toast';
import { Plus, Loader2 } from 'lucide-react';
import { ValoracionPriority } from '@/types/Valoracion';

interface NewValoracionDialogProps {
  children?: React.ReactNode;
  onSuccess?: () => void;
}

export const NewValoracionDialog = ({ children, onSuccess }: NewValoracionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { createValoracion } = useValoraciones();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    company_name: '',
    client_name: '',
    company_sector: '',
    company_description: '',
    priority: 'medium' as ValoracionPriority,
    valoracion_method: '',
    assigned_to: '',
    valoracion_ev: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.company_name || !formData.client_name) {
      toast({
        title: "Campos requeridos",
        description: "El nombre de la empresa y cliente son obligatorios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const valoracionData = {
        company_name: formData.company_name,
        client_name: formData.client_name,
        company_sector: formData.company_sector || undefined,
        company_description: formData.company_description || undefined,
        priority: formData.priority,
        valoracion_method: formData.valoracion_method || undefined,
        assigned_to: formData.assigned_to || undefined,
        valoracion_ev: formData.valoracion_ev ? parseFloat(formData.valoracion_ev) : undefined,
      };

      await createValoracion(valoracionData);
      
      toast({
        title: "Valoración creada",
        description: "La nueva valoración ha sido creada exitosamente",
      });
      
      // Reset form
      setFormData({
        company_name: '',
        client_name: '',
        company_sector: '',
        company_description: '',
        priority: 'medium',
        valoracion_method: '',
        assigned_to: '',
        valoracion_ev: '',
      });
      
      setOpen(false);
      onSuccess?.();
      
    } catch (error) {
      console.error('Error creating valoracion:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la valoración. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Nueva Valoración
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crear Nueva Valoración</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Empresa *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                placeholder="Nombre de la empresa"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="client_name">Cliente *</Label>
              <Input
                id="client_name"
                value={formData.client_name}
                onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                placeholder="Nombre del cliente"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_sector">Sector</Label>
              <Input
                id="company_sector"
                value={formData.company_sector}
                onChange={(e) => setFormData(prev => ({ ...prev, company_sector: e.target.value }))}
                placeholder="Sector de la empresa"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridad</Label>
              <Select value={formData.priority} onValueChange={(value: ValoracionPriority) => setFormData(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🟢 Baja</SelectItem>
                  <SelectItem value="medium">🟡 Media</SelectItem>
                  <SelectItem value="high">🟠 Alta</SelectItem>
                  <SelectItem value="urgent">🔴 Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valoracion_method">Método de Valoración</Label>
              <Input
                id="valoracion_method"
                value={formData.valoracion_method}
                onChange={(e) => setFormData(prev => ({ ...prev, valoracion_method: e.target.value }))}
                placeholder="DCF, Múltiplos, etc."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="valoracion_ev">Valor Estimado (€)</Label>
              <Input
                id="valoracion_ev"
                type="number"
                value={formData.valoracion_ev}
                onChange={(e) => setFormData(prev => ({ ...prev, valoracion_ev: e.target.value }))}
                placeholder="0"
                min="0"
                step="1000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assigned_to">Analista Asignado</Label>
            <Input
              id="assigned_to"
              value={formData.assigned_to}
              onChange={(e) => setFormData(prev => ({ ...prev, assigned_to: e.target.value }))}
              placeholder="Nombre del analista"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_description">Descripción</Label>
            <Textarea
              id="company_description"
              value={formData.company_description}
              onChange={(e) => setFormData(prev => ({ ...prev, company_description: e.target.value }))}
              placeholder="Descripción de la empresa y valoración..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Crear Valoración
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};