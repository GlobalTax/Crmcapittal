import { useState } from 'react';
import { Users, Plus, Mail, Phone, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useContacts } from '@/hooks/useContacts';
import { Company } from '@/types/Company';
import { EmptyState } from '@/components/ui/EmptyState';
import { CreateContactDialog } from '@/components/contacts/CreateContactDialog';
import { useNavigate } from 'react-router-dom';

interface CompanyContactsTabProps {
  company: Company;
}

export const CompanyContactsTab = ({ company }: CompanyContactsTabProps) => {
  const { contacts, isLoading, createContact, isCreating } = useContacts();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const navigate = useNavigate();

  const companyContacts = contacts?.filter(contact => 
    contact.company?.toLowerCase().includes(company.name.toLowerCase()) ||
    contact.company_id === company.id
  ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (companyContacts.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Aún no hay contactos"
        subtitle="Añade contactos de esta empresa para empezar a construir relaciones"
        action={{
          label: "Añadir Contacto",
          onClick: () => setShowCreateDialog(true)
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          Contactos de la Empresa ({companyContacts.length})
        </h3>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Añadir Contacto
        </Button>
      </div>

      <div className="grid gap-4">
        {companyContacts.map((contact) => (
          <div key={contact.id} className="p-4 border border-border rounded-lg hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium">{contact.name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {contact.contact_type}
                  </Badge>
                  {contact.lifecycle_stage && (
                    <Badge variant="secondary" className="text-xs">
                      {contact.lifecycle_stage}
                    </Badge>
                  )}
                </div>

                {contact.position && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {contact.position}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {contact.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span>{contact.email}</span>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span>{contact.phone}</span>
                    </div>
                  )}
                  {contact.linkedin_url && (
                    <div className="flex items-center gap-1">
                      <Linkedin className="h-3 w-3" />
                      <span>LinkedIn</span>
                    </div>
                  )}
                </div>

                {contact.last_interaction_date && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Último contacto: {new Date(contact.last_interaction_date).toLocaleDateString('es-ES')}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/contactos/${contact.id}`)}
                >
                  Ver
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/contactos/${contact.id}?edit=true`)}
                >
                  Editar
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <CreateContactDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateContact={(contactData) => {
          createContact({
            ...contactData,
            company: company.name,
          });
          setShowCreateDialog(false);
        }}
        isCreating={isCreating}
      />
    </div>
  );
};