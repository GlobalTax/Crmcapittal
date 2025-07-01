
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone } from "lucide-react";
import { Negocio } from "@/types/Negocio";

interface ContactSidebarProps {
  negocio: Negocio;
}

export const ContactSidebar = ({ negocio }: ContactSidebarProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="h-5 w-5 mr-2" />
          Contactos (1)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {negocio.contact ? (
          <div className="space-y-3">
            <div>
              <p className="font-medium">{negocio.contact.name}</p>
              {negocio.contact.position && (
                <p className="text-sm text-gray-500">{negocio.contact.position}</p>
              )}
            </div>
            {negocio.contact.email && (
              <div className="flex items-center text-sm">
                <Mail className="h-4 w-4 mr-2 text-gray-400" />
                <a href={`mailto:${negocio.contact.email}`} className="text-blue-600 hover:underline">
                  {negocio.contact.email}
                </a>
              </div>
            )}
            {negocio.contact.phone && (
              <div className="flex items-center text-sm">
                <Phone className="h-4 w-4 mr-2 text-gray-400" />
                <a href={`tel:${negocio.contact.phone}`} className="text-blue-600 hover:underline">
                  {negocio.contact.phone}
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
