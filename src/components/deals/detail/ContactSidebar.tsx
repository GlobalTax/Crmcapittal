
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone } from "lucide-react";
import { Deal } from "@/types/Deal";

interface ContactSidebarProps {
  deal: Deal;
}

export const ContactSidebar = ({ deal }: ContactSidebarProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="h-5 w-5 mr-2" />
          Contactos (1)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {deal.contact ? (
          <div className="space-y-3">
            <div>
              <p className="font-medium">{deal.contact.name}</p>
              {deal.contact.position && (
                <p className="text-sm text-gray-500">{deal.contact.position}</p>
              )}
            </div>
            {deal.contact.email && (
              <div className="flex items-center text-sm">
                <Mail className="h-4 w-4 mr-2 text-gray-400" />
                <a href={`mailto:${deal.contact.email}`} className="text-blue-600 hover:underline">
                  {deal.contact.email}
                </a>
              </div>
            )}
            {deal.contact.phone && (
              <div className="flex items-center text-sm">
                <Phone className="h-4 w-4 mr-2 text-gray-400" />
                <a href={`tel:${deal.contact.phone}`} className="text-blue-600 hover:underline">
                  {deal.contact.phone}
                </a>
              </div>
            )}
          </div>
        ) : (deal.contact_name || deal.contact_email || deal.contact_phone) ? (
          <div className="space-y-3">
            {deal.contact_name && (
              <div>
                <p className="font-medium">{deal.contact_name}</p>
                {deal.contact_role && (
                  <p className="text-sm text-gray-500">{deal.contact_role}</p>
                )}
              </div>
            )}
            {deal.contact_email && (
              <div className="flex items-center text-sm">
                <Mail className="h-4 w-4 mr-2 text-gray-400" />
                <a href={`mailto:${deal.contact_email}`} className="text-blue-600 hover:underline">
                  {deal.contact_email}
                </a>
              </div>
            )}
            {deal.contact_phone && (
              <div className="flex items-center text-sm">
                <Phone className="h-4 w-4 mr-2 text-gray-400" />
                <a href={`tel:${deal.contact_phone}`} className="text-blue-600 hover:underline">
                  {deal.contact_phone}
                </a>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No hay contactos asociados</p>
        )}
      </CardContent>
    </Card>
  );
};
