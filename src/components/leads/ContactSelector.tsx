import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Contact } from "@/types/Contact";
import { logger } from "@/utils/productionLogger";

interface ContactSelectorProps {
  selectedContactId?: string;
  onContactSelect: (contact: Contact | null) => void;
  onCreateNew: (contactData: Partial<Contact>) => void;
}

export const ContactSelector = ({ selectedContactId, onContactSelect, onCreateNew }: ContactSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state for new contact
  const [newContactData, setNewContactData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    position: ""
  });

  // Load contacts
  useEffect(() => {
    const loadContacts = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .neq('lifecycle_stage', 'marketing_qualified_lead') // Exclude leads
          .order('name');
        
        if (error) throw error;
        setContacts((data || []) as Contact[]);
      } catch (error) {
        logger.error('Failed to load contacts for selector', { error });
      } finally {
        setIsLoading(false);
      }
    };

    loadContacts();
  }, []);

  // Find selected contact
  useEffect(() => {
    if (selectedContactId && contacts.length > 0) {
      const contact = contacts.find(c => c.id === selectedContactId);
      setSelectedContact(contact || null);
    }
  }, [selectedContactId, contacts]);

  // Filter contacts based on search
  useEffect(() => {
    if (!searchTerm) {
      setFilteredContacts(contacts.slice(0, 10)); // Show first 10
      return;
    }

    const filtered = contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (contact.company?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    ).slice(0, 10);

    setFilteredContacts(filtered);
  }, [searchTerm, contacts]);

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    onContactSelect(contact);
    setSearchTerm("");
  };

  const handleCreateNew = () => {
    if (newContactData.name && newContactData.email) {
      onCreateNew({
        ...newContactData,
        contact_type: 'prospect',
        lifecycle_stage: 'opportunity'
      });
      setShowCreateDialog(false);
      setNewContactData({
        name: "",
        email: "",
        phone: "",
        company: "",
        position: ""
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Contacto</Label>
        
        {selectedContact ? (
          <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">{selectedContact.name}</p>
                <p className="text-sm text-muted-foreground">{selectedContact.email}</p>
                {selectedContact.company && (
                  <Badge variant="secondary" className="text-xs mt-1">
                    {selectedContact.company}
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedContact(null);
                onContactSelect(null);
              }}
            >
              Cambiar
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar contacto existente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {searchTerm && (
              <div className="border rounded-lg bg-card max-h-48 overflow-y-auto">
                {isLoading ? (
                  <div className="p-3 text-center text-sm text-muted-foreground">
                    Buscando...
                  </div>
                ) : filteredContacts.length > 0 ? (
                  filteredContacts.map((contact) => (
                    <button
                      key={contact.id}
                      onClick={() => handleContactSelect(contact)}
                      className="w-full p-3 text-left hover:bg-muted/50 border-b last:border-b-0 transition-colors"
                    >
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-sm text-muted-foreground">{contact.email}</div>
                      {contact.company && (
                        <div className="text-xs text-muted-foreground mt-1">{contact.company}</div>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-center text-sm text-muted-foreground">
                    No se encontraron contactos
                  </div>
                )}
              </div>
            )}

            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(true)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear nuevo contacto
            </Button>
          </div>
        )}
      </div>

      {/* Create New Contact Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Contacto</DialogTitle>
            <DialogDescription>
              Ingresa la información del contacto que se asociará al lead.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="contact-name">Nombre *</Label>
              <Input
                id="contact-name"
                value={newContactData.name}
                onChange={(e) => setNewContactData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre completo"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="contact-email">Email *</Label>
              <Input
                id="contact-email"
                type="email"
                value={newContactData.email}
                onChange={(e) => setNewContactData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="correo@empresa.com"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="contact-phone">Teléfono</Label>
              <Input
                id="contact-phone"
                value={newContactData.phone}
                onChange={(e) => setNewContactData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+34 600 000 000"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="contact-company">Empresa</Label>
              <Input
                id="contact-company"
                value={newContactData.company}
                onChange={(e) => setNewContactData(prev => ({ ...prev, company: e.target.value }))}
                placeholder="Nombre de la empresa"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="contact-position">Cargo</Label>
              <Input
                id="contact-position"
                value={newContactData.position}
                onChange={(e) => setNewContactData(prev => ({ ...prev, position: e.target.value }))}
                placeholder="Director, CEO, etc."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateNew}
              disabled={!newContactData.name || !newContactData.email}
            >
              Crear Contacto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};