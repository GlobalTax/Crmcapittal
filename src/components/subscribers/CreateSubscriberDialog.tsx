import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useSubscribers } from '@/hooks/useSubscribers';

interface CreateSubscriberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSubscriberDialog({ open, onOpenChange }: CreateSubscriberDialogProps) {
  const { createSubscriber, isCreating } = useSubscribers();
  const [formData, setFormData] = useState({
    email: '',
    segment: 'general',
    verified: false,
    unsubscribed: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSubscriber(formData);
    setFormData({ email: '', segment: 'general', verified: false, unsubscribed: false });
    onOpenChange(false);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nuevo Suscriptor</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="segment">Segmento</Label>
            <Select value={formData.segment} onValueChange={(value) => handleChange('segment', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="investors">Inversores</SelectItem>
                <SelectItem value="buyers">Compradores</SelectItem>
                <SelectItem value="sellers">Vendedores</SelectItem>
                <SelectItem value="advisors">Asesores</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified"
                checked={formData.verified}
                onCheckedChange={(checked) => handleChange('verified', checked)}
              />
              <Label htmlFor="verified">Verificado</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="unsubscribed"
                checked={formData.unsubscribed}
                onCheckedChange={(checked) => handleChange('unsubscribed', checked)}
              />
              <Label htmlFor="unsubscribed">Desuscrito</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Creando...' : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}