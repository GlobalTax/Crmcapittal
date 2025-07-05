import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateContactData, ContactType } from '@/types/Contact';

interface PersonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateContact: (data: CreateContactData) => void;
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
    language_preference: 'es'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    // Split name into first/last if provided as full name
    const nameParts = formData.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    onCreateContact({
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
      linkedin_url: '',
      website_url: '',
      sectors_of_interest: [],
      investment_capacity_min: undefined,
      investment_capacity_max: undefined,
      deal_preferences: null,
      notes: '',
      time_zone: ''
    });

    // Reset form
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
      language_preference: 'es'
    });
    onOpenChange(false);
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
                  Create person
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