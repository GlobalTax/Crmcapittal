
import { User, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Contact } from "@/types/Contact";

interface ContactsStatsCardsProps {
  contacts: Contact[];
}

export const ContactsStatsCards = ({ contacts }: ContactsStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Contactos</p>
              <p className="text-2xl font-semibold text-gray-900">{contacts.length}</p>
            </div>
            <User className="h-8 w-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Clientes</p>
              <p className="text-2xl font-semibold text-purple-600">
                {contacts.filter(c => c.contact_type === 'cliente').length}
              </p>
            </div>
            <Building2 className="h-8 w-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Franquicias</p>
              <p className="text-2xl font-semibold text-green-600">
                {contacts.filter(c => c.contact_type === 'franquicia').length}
              </p>
            </div>
            <Building2 className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Prospects</p>
              <p className="text-2xl font-semibold text-blue-600">
                {contacts.filter(c => c.contact_type === 'prospect').length}
              </p>
            </div>
            <User className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
