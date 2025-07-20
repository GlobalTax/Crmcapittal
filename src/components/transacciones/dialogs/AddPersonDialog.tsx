import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus } from 'lucide-react';
import { useTransaccionPeople } from '@/hooks/useTransaccionPeople';

interface AddPersonDialogProps {
  transaccionId: string;
}

export function AddPersonDialog({ transaccionId }: AddPersonDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    company: '',
    is_primary: false
  });
  const [loading, setLoading] = useState(false);

  const { createPerson } = useTransaccionPeople(transaccionId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.role) {
      return;
    }

    setLoading(true);
    
    const { error } = await createPerson({
      transaccion_id: transaccionId,
      name: formData.name,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      role: formData.role,
      company: formData.company || undefined,
      is_primary: formData.is_primary,
      created_by: undefined // Will be set by the hook
    });

    if (!error) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: '',
        company: '',
        is_primary: false
      });
      setOpen(false);
    }
    
    setLoading(false);
  };

  const roleOptions = [
    { value: 'Comprador', label: 'Comprador' },
    { value: 'Vendedor', label: 'Vendedor' },
    { value: 'Asesor', label: 'Asesor' },
    { value: 'Inversor', label: 'Inversor' },
    { value: 'Consultor', label: 'Consultor' },
    { value: 'Abogado', label: 'Abogado' },
    { value: 'Contable', label: 'Contable' },
    { value: 'Otro', label: 'Otro' }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Persona
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar Nueva Persona</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nombre completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rol *</Label>
            <Select 
              value={formData.role} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Empresa</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              placeholder="Nombre de la empresa"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="email@ejemplo.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+34 666 777 888"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_primary"
              checked={formData.is_primary}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_primary: checked }))}
            />
            <Label htmlFor="is_primary">Contacto principal</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !formData.name || !formData.role}>
              {loading ? 'Agregando...' : 'Agregar Persona'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}