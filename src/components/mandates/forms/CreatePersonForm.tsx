
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useMandatePeople } from '@/hooks/useMandatePeople';

interface CreatePersonFormProps {
  mandateId: string;
  onSuccess: () => void;
}

export const CreatePersonForm = ({ mandateId, onSuccess }: CreatePersonFormProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('contacto');
  const [company, setCompany] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const { createPerson } = useMandatePeople(mandateId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const result = await createPerson({
      mandate_id: mandateId,
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      role,
      company: company.trim() || undefined,
      is_primary: isPrimary
    });

    if (result.data) {
      setName('');
      setEmail('');
      setPhone('');
      setRole('contacto');
      setCompany('');
      setIsPrimary(false);
      onSuccess();
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Añadir Nueva Persona</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Nombre Completo</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Juan Pérez"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="juan@empresa.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Teléfono</label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+34 600 000 000"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Rol</label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contacto">Contacto</SelectItem>
                <SelectItem value="decision_maker">Decisor</SelectItem>
                <SelectItem value="influencer">Influyente</SelectItem>
                <SelectItem value="gatekeeper">Guardián</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
                <SelectItem value="financial">Financiero</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Empresa</label>
            <Input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Nombre de la empresa"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="primary-contact"
            checked={isPrimary}
            onCheckedChange={setIsPrimary}
          />
          <label htmlFor="primary-contact" className="text-sm font-medium">
            Contacto Principal
          </label>
        </div>
        <div className="flex gap-2 justify-end">
          <Button type="submit">Añadir Persona</Button>
        </div>
      </form>
    </DialogContent>
  );
};
