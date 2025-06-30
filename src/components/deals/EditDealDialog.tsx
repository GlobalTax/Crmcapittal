
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Deal, DealPriority, DealType } from "@/types/Deal";
import { useStages } from "@/hooks/useStages";
import { toast } from "sonner";

interface EditDealDialogProps {
  deal: Deal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (updates: Partial<Deal>) => Promise<void>;
}

export const EditDealDialog = ({ deal, open, onOpenChange, onSuccess }: EditDealDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    deal_name: deal.deal_name,
    company_name: deal.company_name || '',
    deal_value: deal.deal_value || 0,
    deal_type: deal.deal_type as DealType,
    priority: deal.priority as DealPriority,
    stage_id: deal.stage_id || '',
    contact_name: deal.contact_name || '',
    contact_email: deal.contact_email || '',
    contact_phone: deal.contact_phone || '',
    description: deal.description || '',
    revenue: deal.revenue || 0,
    ebitda: deal.ebitda || 0,
    sector: deal.sector || '',
    location: deal.location || '',
    employees: deal.employees || 0,
  });

  const { stages } = useStages('DEAL');

  useEffect(() => {
    setFormData({
      deal_name: deal.deal_name,
      company_name: deal.company_name || '',
      deal_value: deal.deal_value || 0,
      deal_type: deal.deal_type as DealType,
      priority: deal.priority as DealPriority,
      stage_id: deal.stage_id || '',
      contact_name: deal.contact_name || '',
      contact_email: deal.contact_email || '',
      contact_phone: deal.contact_phone || '',
      description: deal.description || '',
      revenue: deal.revenue || 0,
      ebitda: deal.ebitda || 0,
      sector: deal.sector || '',
      location: deal.location || '',
      employees: deal.employees || 0,
    });
  }, [deal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSuccess(formData);
      toast.success('Deal actualizado correctamente');
    } catch (error) {
      console.error('Error updating deal:', error);
      toast.error('Error al actualizar el deal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Deal</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="deal_name">Nombre del Deal *</Label>
              <Input
                id="deal_name"
                value={formData.deal_name}
                onChange={(e) => setFormData({ ...formData, deal_name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="company_name">Empresa</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="deal_value">Valor del Deal (€)</Label>
              <Input
                id="deal_value"
                type="number"
                value={formData.deal_value}
                onChange={(e) => setFormData({ ...formData, deal_value: Number(e.target.value) })}
              />
            </div>

            <div>
              <Label htmlFor="deal_type">Tipo de Deal</Label>
              <Select value={formData.deal_type} onValueChange={(value: DealType) => setFormData({ ...formData, deal_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="venta">Venta</SelectItem>
                  <SelectItem value="compra">Compra</SelectItem>
                  <SelectItem value="fusion">Fusión</SelectItem>
                  <SelectItem value="valoracion">Valoración</SelectItem>
                  <SelectItem value="consultoria">Consultoría</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Prioridad</Label>
              <Select value={formData.priority} onValueChange={(value: DealPriority) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baja">Baja</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="stage_id">Etapa</Label>
              <Select value={formData.stage_id} onValueChange={(value) => setFormData({ ...formData, stage_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar etapa" />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Actualizando...' : 'Actualizar Deal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
