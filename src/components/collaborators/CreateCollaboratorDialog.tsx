import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CreateCollaboratorData, CollaboratorType } from '@/types/Collaborator';
import { UserPlus } from 'lucide-react';

interface CreateCollaboratorDialogProps {
  onCreateCollaborator: (data: CreateCollaboratorData) => Promise<any>;
  isCreating?: boolean;
}

const collaboratorTypeLabels: Record<CollaboratorType, string> = {
  referente: 'Referente',
  partner_comercial: 'Partner Comercial',
  agente: 'Agente',
  freelancer: 'Freelancer'
};

export const CreateCollaboratorDialog: React.FC<CreateCollaboratorDialogProps> = ({
  onCreateCollaborator,
  isCreating = false
}) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CreateCollaboratorData>({
    name: '',
    email: '',
    phone: '',
    collaborator_type: 'referente',
    commission_percentage: 15,
    base_commission: 0,
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onCreateCollaborator(formData);
      setOpen(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        collaborator_type: 'referente',
        commission_percentage: 15,
        base_commission: 0,
        notes: ''
      });
    } catch (error) {
      console.error('Error creating collaborator:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Nuevo Colaborador
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Colaborador</DialogTitle>
          <DialogDescription>
            Agrega un nuevo colaborador al sistema con su información de contacto y comisiones.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="collaborator_type">Tipo de Colaborador *</Label>
              <Select
                value={formData.collaborator_type}
                onValueChange={(value: CollaboratorType) => 
                  setFormData(prev => ({ ...prev, collaborator_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(collaboratorTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="commission_percentage">Comisión (%)</Label>
              <Input
                id="commission_percentage"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.commission_percentage}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  commission_percentage: parseFloat(e.target.value) || 0 
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="base_commission">Comisión Base (€)</Label>
              <Input
                id="base_commission"
                type="number"
                min="0"
                step="0.01"
                value={formData.base_commission}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  base_commission: parseFloat(e.target.value) || 0 
                }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Información adicional sobre el colaborador..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Creando...' : 'Crear Colaborador'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};