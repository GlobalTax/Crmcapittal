import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Building, User } from 'lucide-react';
import { Contact } from '@/types/Contact';

interface ContactCardProps {
  contact: Contact;
  onView?: (contact: Contact) => void;
  onEdit?: (contact: Contact) => void;
  onDelete?: (contactId: string) => void;
}

export const ContactCard = ({ contact, onView, onEdit, onDelete }: ContactCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">{contact.name}</h3>
              {contact.position && (
                <p className="text-sm text-muted-foreground">{contact.position}</p>
              )}
            </div>
          </div>
          <Badge variant="secondary" className="capitalize">
            {contact.contact_type || 'prospect'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {contact.email && (
          <div className="flex items-center space-x-2 text-sm">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{contact.email}</span>
          </div>
        )}
        
        {contact.phone && (
          <div className="flex items-center space-x-2 text-sm">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{contact.phone}</span>
          </div>
        )}
        
        {contact.company && (
          <div className="flex items-center space-x-2 text-sm">
            <Building className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{contact.company}</span>
          </div>
        )}
        
        <div className="flex space-x-2 pt-2">
          {onView && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onView(contact)}
              className="flex-1"
            >
              Ver
            </Button>
          )}
          {onEdit && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEdit(contact)}
              className="flex-1"
            >
              Editar
            </Button>
          )}
          {onDelete && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onDelete(contact.id)}
              className="text-destructive hover:text-destructive"
            >
              Eliminar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};