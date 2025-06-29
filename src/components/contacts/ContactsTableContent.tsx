
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Contact } from "@/types/Contact";
import { ContactsTableRow } from "./ContactsTableRow";
import { ContactsEmptyState } from "./ContactsEmptyState";

interface ContactsTableContentProps {
  filteredContacts: Contact[];
  totalContacts: number;
  searchTerm: string;
  onEditContact?: (contact: Contact) => void;
  onDeleteContact?: (contactId: string) => void;
}

export const ContactsTableContent = ({ 
  filteredContacts,
  totalContacts,
  searchTerm,
  onEditContact,
  onDeleteContact
}: ContactsTableContentProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {filteredContacts.length} contactos
          {searchTerm && ` (filtrados de ${totalContacts})`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contacto</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Origen</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => (
                <ContactsTableRow
                  key={contact.id}
                  contact={contact}
                  onEdit={onEditContact}
                  onDelete={onDeleteContact}
                />
              ))}
            </TableBody>
          </Table>
        </div>
        
        {filteredContacts.length === 0 && (
          <ContactsEmptyState searchTerm={searchTerm} />
        )}
      </CardContent>
    </Card>
  );
};
