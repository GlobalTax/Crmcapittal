import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { CreateContactData, ContactType, ContactRole } from '@/types/Contact';

interface PersonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateContact: (data: CreateContactData) => Promise<void>;
  isCreating?: boolean;
}

export const PersonModal = ({
  open,
  onOpenChange,
  onCreateContact,
  isCreating
}: PersonModalProps) => {
  const [formData, setFormData] = useState<Partial<CreateContactData>>({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    contact_type: 'other',
    contact_priority: 'medium',
    contact_source: 'manual',
    preferred_contact_method: 'email',
    language_preference: 'es',
    lifecycle_stage: 'customer',
    roles: [],
    contact_roles: [],
    contact_status: 'active'
  });

  const [newRole, setNewRole] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      console.log('❌ Form validation failed - missing name or email');
      return;
    }

    console.log('📝 Submitting contact form:', {
      name: formData.name,
      email: formData.email,
      contact_type: formData.contact_type,
      lifecycle_stage: formData.lifecycle_stage
    });

    try {
      await onCreateContact({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        company: formData.company || '',
        position: formData.position || '',
        contact_type: formData.contact_type as ContactType || 'other',
        contact_priority: formData.contact_priority || 'medium',
        contact_source: formData.contact_source || 'manual',
        preferred_contact_method: formData.preferred_contact_method || 'email',
        language_preference: formData.language_preference || 'es',
        lifecycle_stage: formData.lifecycle_stage || 'customer',
        roles: formData.roles || [],
        contact_roles: formData.contact_roles || ['other'],
        contact_status: formData.contact_status || 'active',
        linkedin_url: '',
        website_url: '',
        sectors_of_interest: [],
        investment_capacity_min: undefined,
        investment_capacity_max: undefined,
        deal_preferences: null,
        notes: '',
        time_zone: ''
      });

      console.log('✅ Contact creation completed successfully');

      // Reset form on success
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        position: '',
        contact_type: 'other',
        contact_priority: 'medium',
        contact_source: 'manual',
        preferred_contact_method: 'email',
        language_preference: 'es',
        lifecycle_stage: 'customer',
        roles: [],
        contact_roles: [],
        contact_status: 'active'
      });
      onOpenChange(false);
      console.log('✅ Contact created and form closed');
    } catch (error) {
      console.error('❌ Error creating contact:', error);
      // Keep form open on error so user can retry
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addRole = (role: string) => {
    if (role && !formData.roles?.includes(role)) {
      updateField('roles', [...(formData.roles || []), role]);
    }
    // También actualizar contact_roles con los nuevos valores
    const contactRole = role as ContactRole;
    if (role && !formData.contact_roles?.includes(contactRole)) {
      updateField('contact_roles', [...(formData.contact_roles || []), contactRole]);
    }
  };

  const removeRole = (role: string) => {
    updateField('roles', formData.roles?.filter(r => r !== role) || []);
    updateField('contact_roles', formData.contact_roles?.filter(r => r !== role) || []);
  };

  const handleAddCustomRole = () => {
    if (newRole.trim()) {
      addRole(newRole.trim());
      setNewRole('');
    }
  };

  const predefinedRoles: ContactRole[] = ['owner', 'buyer', 'advisor', 'investor', 'target', 'client', 'prospect', 'lead'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Create person</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="templates">Create templates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4 mt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Full name *</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name || ''}
                    onChange={(e) => updateField('name', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email || ''}
                    onChange={(e) => updateField('email', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="+34 600 000 000"
                    value={formData.phone || ''}
                    onChange={(e) => updateField('phone', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="position">Job title</Label>
                  <Input
                    id="position"
                    placeholder="CEO, Manager, etc."
                    value={formData.position || ''}
                    onChange={(e) => updateField('position', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    placeholder="Company name"
                    value={formData.company || ''}
                    onChange={(e) => updateField('company', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="lifecycle_stage">Etapa del Ciclo</Label>
                  <Select value={formData.lifecycle_stage || 'customer'} onValueChange={(value) => updateField('lifecycle_stage', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona la etapa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead">Lead - Primer contacto</SelectItem>
                      <SelectItem value="cliente">Cliente - Transacción cerrada</SelectItem>
                      <SelectItem value="suscriptor">Suscriptor - Solo contenidos</SelectItem>
                      <SelectItem value="proveedor">Proveedor - Nos vende servicios</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Roles Section */}
              <div className="space-y-2">
                <Label>Roles</Label>
                <div className="flex gap-2 flex-wrap">
                  {predefinedRoles.map(role => (
                    <Button
                      key={role}
                      type="button"
                      variant={formData.roles?.includes(role) ? "default" : "outline"}
                      size="sm"
                      onClick={() => formData.roles?.includes(role) ? removeRole(role) : addRole(role)}
                    >
                      {role}
                    </Button>
                  ))}
                </div>
                
                {/* Custom role input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Agregar rol personalizado..."
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomRole())}
                  />
                  <Button type="button" variant="outline" onClick={handleAddCustomRole}>
                    Agregar
                  </Button>
                </div>

                {/* Selected roles display */}
                {formData.roles && formData.roles.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-2">
                    {formData.roles.map(role => (
                      <Badge key={role} variant="secondary" className="pr-1">
                        {role}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="ml-1 h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => removeRole(role)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating || !formData.name || !formData.email}
                  className="relative"
                >
                  {isCreating ? 'Creating...' : 'Create person'}
                  <span className="ml-2 text-xs text-muted opacity-60">⌘⇧↩</span>
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4 mt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Create templates for faster person creation</p>
              <Button variant="outline" className="mt-4">
                + Create template
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};