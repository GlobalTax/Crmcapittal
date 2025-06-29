
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, ExternalLink } from "lucide-react";
import { useContacts } from "@/hooks/useContacts";

interface ContactSelectorProps {
  dealData: any;
  updateField: (field: string, value: string) => void;
}

export const ContactSelector = ({ dealData, updateField }: ContactSelectorProps) => {
  const { contacts, isLoading } = useContacts();
  const [selectedContact, setSelectedContact] = useState<any>(null);

  useEffect(() => {
    if (dealData.contact_id && contacts.length > 0) {
      const contact = contacts.find(c => c.id === dealData.contact_id);
      setSelectedContact(contact);
    }
  }, [dealData.contact_id, contacts]);

  const handleContactSelect = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    updateField("contact_id", contactId);
    setSelectedContact(contact);
    
    // Auto-llenar información del contacto para compatibilidad
    if (contact) {
      updateField("contact_name", contact.name || '');
      updateField("contact_email", contact.email || '');
      updateField("contact_phone", contact.phone || contact.mobile || '');
      updateField("contact_role", contact.position || '');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
          <User className="h-4 w-4 mr-2" />
          Asociar Contacto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="contact_id">Seleccionar Contacto Existente</Label>
          <Select 
            value={dealData.contact_id || ''} 
            onValueChange={handleContactSelect}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={isLoading ? "Cargando contactos..." : "Seleccionar un contacto..."} />
            </SelectTrigger>
            <SelectContent>
              {contacts.map(contact => (
                <SelectItem key={contact.id} value={contact.id}>
                  {contact.name} {contact.company && `- ${contact.company}`} {contact.position && `(${contact.position})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-800">¿No encuentras el contacto?</span>
          </div>
          <a 
            href="/contacts" 
            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>Crear Nuevo Contacto</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        
        {/* Información del contacto seleccionado */}
        {selectedContact && (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Información del Contacto:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Nombre:</strong> {selectedContact.name}</p>
              {selectedContact.company && (
                <p><strong>Empresa:</strong> {selectedContact.company}</p>
              )}
              {selectedContact.position && (
                <p><strong>Cargo:</strong> {selectedContact.position}</p>
              )}
              {selectedContact.email && (
                <p><strong>Email:</strong> {selectedContact.email}</p>
              )}
              {(selectedContact.phone || selectedContact.mobile) && (
                <p><strong>Teléfono:</strong> {selectedContact.phone || selectedContact.mobile}</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
