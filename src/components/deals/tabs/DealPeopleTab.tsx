import React, { useState } from 'react';
import { Deal } from '@/types/Deal';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Mail, Phone } from 'lucide-react';

interface AssociatedPerson {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  company?: string;
  is_primary: boolean;
}

interface DealPeopleTabProps {
  deal: Deal;
}

export const DealPeopleTab = ({ deal }: DealPeopleTabProps) => {
  const [people, setPeople] = useState<AssociatedPerson[]>([
    // Mock data - in real implementation, this would come from database
    ...(deal.owner ? [{
      id: deal.ownerId || '1',
      name: deal.owner.name,
      email: deal.owner.email,
      role: 'Deal Owner',
      is_primary: true
    }] : [])
  ]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Associated People</h3>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-1" />
          Add Person
        </Button>
      </div>

      {/* People List */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-3">
          {people.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No people associated</p>
              <p className="text-xs">Add contacts to track stakeholders</p>
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
                            Primary
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-1">
                        {person.role}
                      </p>
                      
                      {person.company && (
                        <p className="text-xs text-muted-foreground">
                          at {person.company}
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