import { Contact } from "@/types/Contact";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  MapPin, 
  Linkedin, 
  Globe,
  Edit2
} from "lucide-react";

interface ContactDetailsDialogProps {
  contact: Contact;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditContact: (contact: Contact) => void;
}

export const ContactDetailsDialog = ({ 
  contact, 
  open, 
  onOpenChange, 
  onEditContact 
}: ContactDetailsDialogProps) => {
  const getTypeBadge = (type: string) => {
    const typeConfig = {
      marketing: { label: "Marketing", color: "bg-pink-100 text-pink-800" },
      sales: { label: "Ventas", color: "bg-blue-100 text-blue-800" },
      franquicia: { label: "Franquicia", color: "bg-green-100 text-green-800" },
      cliente: { label: "Cliente", color: "bg-purple-100 text-purple-800" },
      prospect: { label: "Prospect", color: "bg-gray-100 text-gray-800" },
      other: { label: "Otro", color: "bg-gray-100 text-gray-800" }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig];
    return <Badge variant="outline" className={config?.color || "bg-gray-100 text-gray-800"}>{config?.label || type}</Badge>;
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;
    
    const priorityConfig = {
      low: { label: "Baja", color: "bg-gray-100 text-gray-800" },
      medium: { label: "Media", color: "bg-yellow-100 text-yellow-800" },
      high: { label: "Alta", color: "bg-red-100 text-red-800" }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig];
    if (!config) return null;
    
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {contact.name}
            </DialogTitle>
            <Button onClick={() => onEditContact(contact)} size="sm">
              <Edit2 className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
          <DialogDescription>
            Información detallada del contacto
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información Principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 p-4">
              <div className="pb-2">
                <h3 className="text-sm font-semibold text-black">Tipo</h3>
              </div>
              <div>
                {getTypeBadge(contact.contact_type)}
              </div>
            </div>

            {contact.contact_priority && (
              <div className="bg-white border border-gray-200 p-4">
                <div className="pb-2">
                  <h3 className="text-sm font-semibold text-black">Prioridad</h3>
                </div>
                <div>
                  {getPriorityBadge(contact.contact_priority)}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información de Contacto */}
            <div className="bg-white border border-gray-200 p-4">
              <div className="pb-4">
                <h3 className="text-sm font-semibold text-black">Información de Contacto</h3>
              </div>
              <div className="space-y-3">
                {contact.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <a 
                      href={`mailto:${contact.email}`} 
                      className="text-blue-600 hover:underline"
                    >
                      {contact.email}
                    </a>
                  </div>
                )}

                {contact.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <a 
                      href={`tel:${contact.phone}`} 
                      className="text-blue-600 hover:underline"
                    >
                      {contact.phone}
                    </a>
                  </div>
                )}

                {contact.linkedin_url && (
                  <div className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4 text-blue-600" />
                    <a 
                      href={contact.linkedin_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      LinkedIn
                    </a>
                  </div>
                )}

                {contact.website_url && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <a 
                      href={contact.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {contact.website_url}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Información Profesional */}
            <div className="bg-white border border-gray-200 p-4">
              <div className="pb-4">
                <h3 className="text-sm font-semibold text-black">Información Profesional</h3>
              </div>
              <div className="space-y-3">
                {contact.company && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Empresa:</span>
                    <span className="text-sm">{contact.company}</span>
                  </div>
                )}

                {contact.position && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Cargo:</span>
                    <span className="text-sm">{contact.position}</span>
                  </div>
                )}

                {contact.contact_source && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Origen:</span>
                    <Badge variant="outline">{contact.contact_source}</Badge>
                  </div>
                )}

                {contact.preferred_contact_method && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Método preferido:</span>
                    <span className="text-sm">{contact.preferred_contact_method}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sectores de Interés */}
          {contact.sectors_of_interest && contact.sectors_of_interest.length > 0 && (
            <div className="bg-white border border-gray-200 p-4">
              <div className="pb-4">
                <h3 className="text-sm font-semibold text-black">Sectores de Interés</h3>
              </div>
              <div>
                <div className="flex flex-wrap gap-2">
                  {contact.sectors_of_interest.map((sector, index) => (
                    <Badge key={index} variant="outline">{sector}</Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Notas */}
          {contact.notes && (
            <div className="bg-white border border-gray-200 p-4">
              <div className="pb-4">
                <h3 className="text-sm font-semibold text-black">Notas</h3>
              </div>
              <div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{contact.notes}</p>
              </div>
            </div>
          )}

          {/* Fechas Importantes */}
          <div className="bg-white border border-gray-200 p-4">
            <div className="pb-4">
              <h3 className="text-sm font-semibold text-black">Información del Sistema</h3>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Creado:</span> {formatDate(contact.created_at)}
                </div>
                <div>
                  <span className="font-medium">Actualizado:</span> {formatDate(contact.updated_at)}
                </div>
                {contact.last_interaction_date && (
                  <div>
                    <span className="font-medium">Última interacción:</span> {formatDate(contact.last_interaction_date)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};