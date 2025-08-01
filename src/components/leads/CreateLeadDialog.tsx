import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { FormValidationProvider, useFormValidation } from '@/contexts/FormValidationContext';
import { ValidatedInput } from '@/components/validation/ValidatedInput';
import { ValidatedSelect } from '@/components/validation/ValidatedSelect';
import { getLeadValidationRules } from '@/utils/entityValidationRules';

interface User {
  id: string;
  email: string;
  full_name?: string;
}

const CreateLeadForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company_name: '',
    position: '',
    lead_source: '',
    notes: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    assigned_to_id: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { validateForm, canSave, resetValidation } = useFormValidation();
  const [users, setUsers] = useState<User[]>([]);

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase.from('user_profiles').select('id, email, full_name');
      if (data) setUsers(data);
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    const validationResult = validateForm(formData, getLeadValidationRules());
    
    if (!validationResult.isValid) {
      toast({
        title: "Error de validación",
        description: "Por favor, corrige los errores en el formulario",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase.from('leads').insert({
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        company_name: formData.company_name || null,
        position: formData.position || null,
        lead_source: formData.lead_source || null,
        notes: formData.notes || null,
        priority: formData.priority,
        assigned_to_id: formData.assigned_to_id,
        created_by: user.id
      });

      if (error) throw error;

      toast({
        title: "Lead creado",
        description: "El lead se ha creado exitosamente"
      });

      queryClient.invalidateQueries({ queryKey: ['leads'] });
      resetValidation();
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        position: '',
        lead_source: '',
        notes: '',
        priority: 'medium',
        owner_id: ''
      });
      onSuccess?.();
    } catch (error) {
      console.error('Error creating lead:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el lead",
        variant: "destructive"
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="max-h-[60vh] overflow-y-auto pr-2">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre *</Label>
            <ValidatedInput
              name="name"
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              validation={{ required: true, minLength: 2, maxLength: 100 }}
              placeholder="Nombre del lead"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <ValidatedInput
                name="email"
                type="email"
                value={formData.email}
                onChange={(value) => setFormData({ ...formData, email: value })}
                validation={{ atLeastOne: ['email', 'phone'], format: 'email' }}
                placeholder="email@ejemplo.com"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Teléfono *</Label>
              <ValidatedInput
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={(value) => setFormData({ ...formData, phone: value })}
                validation={{ atLeastOne: ['email', 'phone'], format: 'phone' }}
                placeholder="+34 600 000 000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="company">Empresa</Label>
              <ValidatedInput
                name="company"
                value={formData.company}
                onChange={(value) => setFormData({ ...formData, company: value })}
                placeholder="Nombre de la empresa"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="position">Cargo</Label>
              <ValidatedInput
                name="position"
                value={formData.position}
                onChange={(value) => setFormData({ ...formData, position: value })}
                placeholder="Cargo del contacto"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="lead_source">Fuente del Lead</Label>
              <ValidatedSelect
                name="lead_source"
                value={formData.lead_source}
                onChange={(value) => setFormData({ ...formData, lead_source: value })}
                options={[
                  { value: 'website', label: 'Sitio Web' },
                  { value: 'referral', label: 'Referencia' },
                  { value: 'social_media', label: 'Redes Sociales' },
                  { value: 'email_campaign', label: 'Campaña de Email' },
                  { value: 'cold_call', label: 'Llamada en Frío' },
                  { value: 'event', label: 'Evento' },
                  { value: 'other', label: 'Otro' }
                ]}
                placeholder="Seleccionar fuente"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="priority">Prioridad</Label>
              <ValidatedSelect
                name="priority"
                value={formData.priority}
                onChange={(value) => setFormData({ ...formData, priority: value as 'low' | 'medium' | 'high' | 'urgent' })}
                options={[
                  { value: 'low', label: 'Baja' },
                  { value: 'medium', label: 'Media' },
                  { value: 'high', label: 'Alta' },
                  { value: 'urgent', label: 'Urgente' }
                ]}
                placeholder="Seleccionar prioridad"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="owner_id">Responsable *</Label>
            <ValidatedSelect
              name="owner_id"
              value={formData.owner_id}
              onChange={(value) => setFormData({ ...formData, owner_id: value })}
              validation={{ required: true }}
              options={users?.map(user => ({
                value: user.id,
                label: user.full_name || user.email
              })) || []}
              placeholder="Seleccionar responsable"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas adicionales sobre el lead..."
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!canSave}>
          Crear Lead
        </Button>
      </div>
    </form>
  );
};

const CreateLeadDialog = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Lead</DialogTitle>
        </DialogHeader>
        <FormValidationProvider>
          <CreateLeadForm onSuccess={() => setOpen(false)} />
        </FormValidationProvider>
      </DialogContent>
    </Dialog>
  );
};

export default CreateLeadDialog;
export { CreateLeadDialog };