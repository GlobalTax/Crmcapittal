
import { Contact } from "@/types/Contact";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  MapPin, 
  Linkedin, 
  Globe,
  Calendar,
  Star,
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
        </DialogHeader>

        <div className="space-y-6">
          {/* Información Principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                {getTypeBadge(contact.contact_type)}
              </CardContent>
            </Card>

            {contact.contact_priority && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Prioridad</CardTitle>
                </CardHeader>
                <CardContent>
                  {getPriorityBadge(contact.contact_priority)}
                </CardContent>
              </Card>
            )}

            {contact.lead_score !== undefined && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Lead Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="font-medium">{contact.lead_score}%</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información de Contacto */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Información de Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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

                {contact.mobile && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Móvil:</span>
                    <a 
                      href={`tel:${contact.mobile}`} 
                      className="text-blue-600 hover:underline"
                    >
                      {contact.mobile}
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

                {(contact.city || contact.country) && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {[contact.city, contact.country].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}

                {contact.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <span className="text-sm">{contact.address}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Información Profesional */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Información Profesional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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

                {contact.job_title && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Título:</span>
                    <span className="text-sm">{contact.job_title}</span>
                  </div>
                )}

                {contact.company_size && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Tamaño empresa:</span>
                    <span className="text-sm">{contact.company_size}</span>
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
              </CardContent>
            </Card>
          </div>

          {/* Sectores de Interés */}
          {contact.sectors_of_interest && contact.sectors_of_interest.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sectores de Interés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {contact.sectors_of_interest.map((sector, index) => (
                    <Badge key={index} variant="outline">{sector}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notas */}
          {contact.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{contact.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Fechas Importantes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información del Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
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
                {contact.next_follow_up_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">Próximo seguimiento:</span> 
                    <span className="text-orange-600">{formatDate(contact.next_follow_up_date)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
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
