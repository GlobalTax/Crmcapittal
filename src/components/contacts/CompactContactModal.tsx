import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Contact } from '@/types/Contact';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, Building2 } from 'lucide-react';

interface CompactContactModalProps {
  contact: Contact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CompactContactModal = ({ contact, open, onOpenChange }: CompactContactModalProps) => {
  if (!contact) return null;

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const getStatusBadge = (status?: string, priority?: string, tags?: string[]) => {
    if (priority === 'high' || tags?.includes('VIP')) {
      return <Badge className="bg-blue-50 text-blue-700 border-blue-200">VIP</Badge>;
    }
    
    switch (status) {
      case 'active':
        return <Badge className="bg-green-50 text-green-700 border-green-200">Activo</Badge>;
      default:
        return <Badge className="bg-gray-50 text-gray-700 border-gray-200">Inactivo</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getInitials(contact.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-xl">{contact.name}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                {getStatusBadge(contact.contact_status, contact.contact_priority, contact.tags_array)}
                {contact.company && (
                  <span className="text-sm text-muted-foreground">{contact.company}</span>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="activity">Actividad</TabsTrigger>
            <TabsTrigger value="deals">Deals</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{contact.email || 'Sin email'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{contact.phone || 'Sin teléfono'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{contact.position || 'Sin posición'}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                  <p className="text-sm">{contact.contact_type || '—'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fuente</label>
                  <p className="text-sm">{contact.contact_source || '—'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Creado</label>
                  <p className="text-sm">{new Date(contact.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            {contact.notes && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Notas</label>
                <p className="text-sm mt-1">{contact.notes}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <p>Actividades próximamente</p>
            </div>
          </TabsContent>

          <TabsContent value="deals" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <p>Deals relacionados próximamente</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};