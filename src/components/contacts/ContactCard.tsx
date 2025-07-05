import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  Eye, 
  Edit, 
  Trash2, 
  Star,
  Calendar
} from "lucide-react";
import { Contact } from "@/types/Contact";

interface ContactCardProps {
  contact: Contact;
  onView?: (contact: Contact) => void;
  onEdit?: (contact: Contact) => void;
  onDelete?: (contactId: string) => void;
}

export function ContactCard({ contact, onView, onEdit, onDelete }: ContactCardProps) {
  const getTypeBadge = (type: string) => {
    const typeConfig = {
      marketing: { label: "Marketing", className: "bg-blue-100 text-blue-800" },
      sales: { label: "Ventas", className: "bg-purple-100 text-purple-800" },
      franquicia: { label: "Franquicia", className: "bg-green-100 text-green-800" },
      cliente: { label: "Cliente", className: "bg-emerald-100 text-emerald-800" },
      prospect: { label: "Prospect", className: "bg-orange-100 text-orange-800" },
      other: { label: "Otro", className: "bg-gray-100 text-gray-800" }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.other;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getPriorityColor = (priority?: string) => {
    const colors = {
      low: "text-green-500",
      medium: "text-yellow-500", 
      high: "text-red-500"
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-border/50">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 bg-primary/10">
              <AvatarFallback className="text-primary font-semibold">
                {getInitials(contact.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {contact.name}
              </h3>
              <p className="text-sm text-muted-foreground">{contact.position || 'Sin cargo'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Star className={`h-4 w-4 ${getPriorityColor(contact.contact_priority)}`} />
            {getTypeBadge(contact.contact_type)}
          </div>
        </div>

        <div className="space-y-3">
          {contact.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a 
                href={`mailto:${contact.email}`}
                className="text-primary hover:underline truncate"
              >
                {contact.email}
              </a>
            </div>
          )}

          {contact.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a 
                href={`tel:${contact.phone}`}
                className="text-primary hover:underline"
              >
                {contact.phone}
              </a>
            </div>
          )}

          {contact.company && (
            <div className="flex items-center gap-2 text-sm">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground truncate">{contact.company}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Creado {formatDate(contact.created_at)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
          <div className="flex gap-1">
            {onView && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onView(contact)}
                className="text-muted-foreground hover:text-primary"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            {onEdit && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onEdit(contact)}
                className="text-muted-foreground hover:text-primary"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onDelete(contact.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {contact.contact_source && (
            <Badge variant="outline" className="text-xs">
              {contact.contact_source}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}