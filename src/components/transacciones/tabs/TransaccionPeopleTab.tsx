import React from 'react';
import { Transaccion } from '@/types/Transaccion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Mail, Phone } from 'lucide-react';
import { useTransaccionPeople } from '@/hooks/useTransaccionPeople';
import { AddPersonDialog } from '../dialogs/AddPersonDialog';

interface AssociatedPerson {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  company?: string;
  is_primary: boolean;
}

interface TransaccionPeopleTabProps {
  transaccion: Transaccion;
}

export const TransaccionPeopleTab = ({ transaccion }: TransaccionPeopleTabProps) => {
  const { people, loading } = useTransaccionPeople(transaccion.id);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Personas Asociadas</h3>
        <AddPersonDialog transaccionId={transaccion.id} />
      </div>

      {/* People List */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Cargando personas...</p>
            </div>
          ) : people.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay personas asociadas</p>
              <p className="text-xs">Agrega contactos para hacer seguimiento de los interesados</p>
            </div>
          ) : (
            people.map((person) => (
              <div
                key={person.id}
                className="flex items-start gap-3 p-4 rounded-lg border border-border bg-neutral-0"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-muted">
                    {person.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">{person.name}</h4>
                        {person.is_primary && (
                          <Badge variant="outline" className="text-xs">
                            Principal
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-1">
                        {person.role}
                      </p>
                      
                      {person.company && (
                        <p className="text-xs text-muted-foreground">
                          en {person.company}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 mt-2">
                        {person.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {person.email}
                            </span>
                          </div>
                        )}
                        {person.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {person.phone}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};