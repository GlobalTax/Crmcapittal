import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, StarOff, Mail, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Contact } from '@/types/Contact';

interface ContactHeaderProps {
  contact: Contact;
  onEdit?: (contact: Contact) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export const ContactHeader = ({ 
  contact, 
  onEdit, 
  onPrevious, 
  onNext, 
  hasPrevious, 
  hasNext 
}: ContactHeaderProps) => {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [showComposeEmail, setShowComposeEmail] = useState(false);

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const handleComposeEmail = () => {
    setShowComposeEmail(true);
  };

  const handleBackToContacts = () => {
    navigate('/contactos');
  };

  return (
    <>
      <div className="flex items-center justify-between p-6 border-b border-border bg-background">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToContacts}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-muted text-sm">
                {getInitials(contact.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-semibold">{contact.name}</h1>
              {contact.company && (
                <p className="text-sm text-muted-foreground">
                  {contact.position ? `${contact.position} at ${contact.company}` : contact.company}
                </p>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFavorite(!isFavorite)}
            className="h-8 w-8 p-0"
          >
            {isFavorite ? (
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ) : (
              <StarOff className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Navigation arrows */}
          {(hasPrevious || hasNext) && (
            <div className="flex items-center gap-1 mr-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onPrevious}
                disabled={!hasPrevious}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onNext}
                disabled={!hasNext}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          <Button variant="outline" size="sm" onClick={handleComposeEmail}>
            <Mail className="h-4 w-4 mr-2" />
            Redactar email
          </Button>
          
          <Button variant="outline" size="sm" onClick={() => onEdit?.(contact)}>
            <Edit2 className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      {/* Compose Email Modal */}
      {showComposeEmail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Redactar Email</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowComposeEmail(false)}>
                ×
              </Button>
            </div>
            <p className="text-muted-foreground mb-4">
              Integración de email próximamente. Esto abrirá tu cliente de email predeterminado para redactar un email a {contact.email}.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowComposeEmail(false)}>
                Cerrar
              </Button>
              <Button onClick={() => {
                if (contact.email) {
                  window.location.href = `mailto:${contact.email}`;
                }
                setShowComposeEmail(false);
              }}>
                Abrir Cliente de Email
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};