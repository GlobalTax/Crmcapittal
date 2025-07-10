import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, User, Mail, Phone, Link } from "lucide-react";
import { Contact } from "@/types/Contact";

interface LinkContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contacts: Contact[];
  companyId: string;
  companyName: string;
  onLinkContact: (contactId: string) => void;
  isLinking: boolean;
}

export const LinkContactDialog = ({ 
  open, 
  onOpenChange, 
  contacts, 
  companyId, 
  companyName,
  onLinkContact,
  isLinking
}: LinkContactDialogProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter contacts that are not already linked to this company
  const availableContacts = useMemo(() => {
    return contacts.filter(contact => 
      contact.company_id !== companyId &&
      !contact.company?.toLowerCase().includes(companyName.toLowerCase()) &&
      contact.contact_status === 'active'
    );
  }, [contacts, companyId, companyName]);

  // Filter contacts based on search term
  const filteredContacts = useMemo(() => {
    if (!searchTerm) return availableContacts;
    
    const searchLower = searchTerm.toLowerCase();
    return availableContacts.filter(contact =>
      contact.name.toLowerCase().includes(searchLower) ||
      contact.email?.toLowerCase().includes(searchLower) ||
      contact.company?.toLowerCase().includes(searchLower) ||
      contact.position?.toLowerCase().includes(searchLower)
    );
  }, [availableContacts, searchTerm]);

  const handleLinkContact = (contactId: string) => {
    onLinkContact(contactId);
    setSearchTerm("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center">
            <Link className="h-5 w-5 mr-2 text-primary" />
            Vincular Contacto Existente
          </DialogTitle>
          <DialogDescription>
            Busca y selecciona un contacto existente para vincularlo a {companyName}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email, empresa o posición..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {filteredContacts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {availableContacts.length === 0 ? (
                <>
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay contactos disponibles para vincular.</p>
                  <p className="text-sm">Todos los contactos ya están vinculados a esta empresa.</p>
                </>
              ) : (
                <>
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No se encontraron contactos que coincidan con la búsqueda.</p>
                  <p className="text-sm">Intenta con otros términos de búsqueda.</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredContacts.map((contact) => (
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

                      {contact.company && (
                        <p className="text-sm text-muted-foreground mb-2">
                          Empresa actual: {contact.company}
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
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleLinkContact(contact.id)}
                      disabled={isLinking}
                    >
                      <Link className="h-4 w-4 mr-2" />
                      {isLinking ? "Vinculando..." : "Vincular"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLinking}
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};