import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, User, Mail, Phone } from 'lucide-react';
import { useContacts } from '@/hooks/useContacts';
import { useOpportunityContacts } from '@/hooks/useOpportunities';

interface AddContactToOpportunityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunityId: string;
  existingContactIds: string[];
}

const contactRoles = [
  { value: 'decision_maker', label: 'Decisor', description: 'Persona que toma la decisión final' },
  { value: 'influencer', label: 'Influenciador', description: 'Influye en la decisión pero no decide' },
  { value: 'champion', label: 'Campeón', description: 'Persona que aboga por nuestra solución' },
  { value: 'advisor', label: 'Asesor', description: 'Proporciona asesoramiento técnico o estratégico' },
  { value: 'legal', label: 'Legal', description: 'Responsable de aspectos legales y contractuales' },
  { value: 'contact', label: 'Contacto', description: 'Contacto general o punto de entrada' },
  { value: 'stakeholder', label: 'Stakeholder', description: 'Parte interesada en el proyecto' },
];

export const AddContactToOpportunityDialog = ({ 
  open, 
  onOpenChange, 
  opportunityId,
  existingContactIds 
}: AddContactToOpportunityDialogProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [notes, setNotes] = useState('');

  const { contacts, isLoading } = useContacts();
  const { addContact, isAdding } = useOpportunityContacts(opportunityId);

  // Filtrar contactos que no están ya asociados a la oportunidad
  const availableContacts = contacts.filter(contact => 
    !existingContactIds.includes(contact.id) &&
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedContact || !selectedRole) return;

    addContact({
      contactId: selectedContact.id,
      role: selectedRole,
      isPrimary,
      notes: notes.trim() || undefined,
    });

    // Reset form
    setSelectedContact(null);
    setSelectedRole('');
    setIsPrimary(false);
    setNotes('');
    setSearchTerm('');
    onOpenChange(false);
  };

  const handleContactSelect = (contact: any) => {
    setSelectedContact(contact);
    setSearchTerm(''); // Limpiar búsqueda al seleccionar
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Añadir contacto a la oportunidad</DialogTitle>
          <DialogDescription>
            Selecciona un contacto existente y define su rol en esta oportunidad.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!selectedContact ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="search">Buscar contacto</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre o empresa..."
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {isLoading ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Cargando contactos...
                  </div>
                ) : availableContacts.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    {searchTerm ? 'No se encontraron contactos' : 'No hay contactos disponibles'}
                  </div>
                ) : (
                  availableContacts.map((contact) => (
                    <div
                      key={contact.id}
                      onClick={() => handleContactSelect(contact)}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{contact.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {contact.company && (
                              <span>{contact.company}</span>
                            )}
                            {contact.email && (
                              <span className="flex items-center gap-1 mt-1">
                                <Mail className="h-3 w-3" />
                                {contact.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              <div className="p-3 border rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{selectedContact.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {selectedContact.company || selectedContact.email}
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedContact(null)}
                  >
                    Cambiar
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rol en la oportunidad</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el rol del contacto" />
                  </SelectTrigger>
                  <SelectContent>
                    {contactRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div>
                          <div className="font-medium">{role.label}</div>
                          <div className="text-xs text-muted-foreground">{role.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="isPrimary" className="text-sm">
                  Marcar como contacto principal
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notas específicas sobre este contacto en la oportunidad..."
                  rows={3}
                />
              </div>
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!selectedContact || !selectedRole || isAdding}
            >
              {isAdding ? 'Añadiendo...' : 'Añadir contacto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};