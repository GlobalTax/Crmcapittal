import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Mail, Phone, User, Crown, Star, Users, UserCheck } from 'lucide-react';
import { OpportunityWithContacts } from '@/types/Opportunity';
import { useOpportunityContacts } from '@/hooks/useOpportunities';
import { AddContactToOpportunityDialog } from './AddContactToOpportunityDialog';

interface OpportunityContactsTabProps {
  opportunity: OpportunityWithContacts;
}

const roleIcons = {
  decision_maker: Crown,
  influencer: Star,
  champion: UserCheck,
  advisor: User,
  legal: Users,
  contact: Mail,
  stakeholder: Users,
};

const roleLabels = {
  decision_maker: 'Decisor',
  influencer: 'Influenciador',
  champion: 'Campeón',
  advisor: 'Asesor',
  legal: 'Legal',
  contact: 'Contacto',
  stakeholder: 'Stakeholder',
};

const roleColors = {
  decision_maker: 'bg-red-100 text-red-800',
  influencer: 'bg-purple-100 text-purple-800',
  champion: 'bg-green-100 text-green-800',
  advisor: 'bg-blue-100 text-blue-800',
  legal: 'bg-orange-100 text-orange-800',
  contact: 'bg-gray-100 text-gray-800',
  stakeholder: 'bg-pink-100 text-pink-800',
};

export const OpportunityContactsTab = ({ opportunity }: OpportunityContactsTabProps) => {
  const [addContactDialogOpen, setAddContactDialogOpen] = useState(false);
  const { removeContact, isRemoving } = useOpportunityContacts(opportunity.id);

  const contacts = opportunity.contacts || [];

  const handleRemoveContact = (contactId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este contacto de la oportunidad?')) {
      removeContact(contactId);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Contactos asociados ({contacts.length})
            </CardTitle>
            <Button 
              onClick={() => setAddContactDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Añadir contacto
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {contacts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay contactos asociados a esta oportunidad</p>
              <Button 
                variant="outline" 
                onClick={() => setAddContactDialogOpen(true)}
                className="mt-4"
              >
                Añadir primer contacto
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {contacts.map((contactAssociation) => {
                const contact = contactAssociation.contact;
                if (!contact) return null;

                const RoleIcon = roleIcons[contactAssociation.role as keyof typeof roleIcons] || User;
                const roleLabel = roleLabels[contactAssociation.role as keyof typeof roleLabels] || contactAssociation.role;
                const roleColor = roleColors[contactAssociation.role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800';

                return (
                  <div 
                    key={contactAssociation.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{contact.name}</h4>
                          {contactAssociation.is_primary && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              Contacto principal
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1">
                            <RoleIcon className="h-4 w-4" />
                            <Badge className={roleColor}>
                              {roleLabel}
                            </Badge>
                          </div>
                          
                          {contact.email && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {contact.email}
                            </div>
                          )}
                          
                          {contact.phone && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {contact.phone}
                            </div>
                          )}
                        </div>
                        
                        {contact.position && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {contact.position}
                          </p>
                        )}
                        
                        {contactAssociation.notes && (
                          <p className="text-sm text-muted-foreground mt-2 italic">
                            "{contactAssociation.notes}"
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`mailto:${contact.email}`, '_blank')}
                        disabled={!contact.email}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`tel:${contact.phone}`, '_blank')}
                        disabled={!contact.phone}
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveContact(contactAssociation.id)}
                        disabled={isRemoving}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AddContactToOpportunityDialog
        open={addContactDialogOpen}
        onOpenChange={setAddContactDialogOpen}
        opportunityId={opportunity.id}
        existingContactIds={contacts.map(c => c.contact_id)}
      />
    </div>
  );
};