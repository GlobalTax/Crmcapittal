
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CreateTransactionData } from '@/types/Transaction';
import { useProposals } from '@/hooks/useProposals';
import { useCompanies } from '@/hooks/useCompanies';
import { useContacts } from '@/hooks/useContacts';

interface CreateTransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTransactionData) => Promise<void>;
}

export const CreateTransactionDialog: React.FC<CreateTransactionDialogProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const { proposals } = useProposals();
  const { companies } = useCompanies();
  const { contacts } = useContacts();
  
  const [formData, setFormData] = useState<CreateTransactionData>({
    proposal_id: '',
    transaction_type: 'sale',
    priority: 'medium',
    currency: 'EUR'
  });
  
  const [loading, setLoading] = useState(false);

  const approvedProposals = proposals.filter(p => p.status === 'approved');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.proposal_id) return;

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
      setFormData({
        proposal_id: '',
        transaction_type: 'sale',
        priority: 'medium',
        currency: 'EUR'
      });
    } catch (error) {
      console.error('Error creating transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProposalChange = (proposalId: string) => {
    const proposal = proposals.find(p => p.id === proposalId);
    if (proposal) {
      setFormData(prev => ({
        ...prev,
        proposal_id: proposalId,
        company_id: proposal.company_id,
        contact_id: proposal.contact_id,
        estimated_value: proposal.total_amount,
        currency: proposal.currency || 'EUR'
      }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crear Nueva Transacción</DialogTitle>
          <DialogDescription>
            Crear una transacción M&A desde una propuesta aprobada
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="proposal_id">Propuesta Base *</Label>
              <Select 
                value={formData.proposal_id} 
                onValueChange={handleProposalChange}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una propuesta aprobada" />
                </SelectTrigger>
                <SelectContent>
                  {approvedProposals.map((proposal) => (
                    <SelectItem key={proposal.id} value={proposal.id}>
                      {proposal.title} - {proposal.contact?.name || 'Sin contacto'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {approvedProposals.length === 0 && (
                <p className="text-sm text-gray-500">
                  No hay propuestas aprobadas disponibles para crear transacciones
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction_type">Tipo de Transacción *</Label>
              <Select 
                value={formData.transaction_type} 
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, transaction_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">Venta</SelectItem>
                  <SelectItem value="acquisition">Adquisición</SelectItem>
                  <SelectItem value="merger">Fusión</SelectItem>
                  <SelectItem value="valuation">Valoración</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridad</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_value">Valor Estimado</Label>
              <Input
                type="number"
                value={formData.estimated_value || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  estimated_value: e.target.value ? parseInt(e.target.value) : undefined 
                }))}
                placeholder="Ej: 5000000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <Select 
                value={formData.currency} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expected_closing_date">Fecha de Cierre Esperada</Label>
              <Input
                type="date"
                value={formData.expected_closing_date || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, expected_closing_date: e.target.value }))}
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Notas adicionales sobre la transacción..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.proposal_id}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Creando...' : 'Crear Transacción'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
