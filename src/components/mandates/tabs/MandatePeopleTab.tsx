import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Mail, Phone, Plus, Building2 } from 'lucide-react';
import { BuyingMandate } from '@/types/BuyingMandate';

interface MandatePeopleTabProps {
  mandate: BuyingMandate;
}

export const MandatePeopleTab: React.FC<MandatePeopleTabProps> = ({ mandate }) => {
  // Mock data - En producción vendría de la base de datos
  const contacts = [
    {
      id: '1',
      name: mandate.client_contact,
      email: mandate.client_email || 'contacto@cliente.com',
      phone: mandate.client_phone || '+34 600 000 000',
      role: 'Cliente Principal',
      company: mandate.client_name,
      type: 'client'
    },
    {
      id: '2',
      name: 'Carlos Martínez',
      email: 'carlos.martinez@asesores.com',
      phone: '+34 600 111 222',
      role: 'Asesor Financiero',
      company: 'Asesores Financieros S.L.',
      type: 'advisor'
    },
    {
      id: '3',
      name: 'Ana García',
      email: 'ana.garcia@legal.com',
      phone: '+34 600 333 444',
      role: 'Abogada',
      company: 'García & Asociados',
      type: 'legal'
    }
  ];

  const getContactTypeColor = (type: string) => {
    switch (type) {
      case 'client': return 'bg-primary/10 text-primary';
      case 'advisor': return 'bg-blue-100 text-blue-800';
      case 'legal': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getContactTypeLabel = (type: string) => {
    switch (type) {
      case 'client': return 'Cliente';
      case 'advisor': return 'Asesor';
      case 'legal': return 'Legal';
      default: return 'Contacto';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header con botón de agregar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Personas del Mandato</h3>
          <p className="text-sm text-muted-foreground">
            Gestiona todos los contactos involucrados en este mandato
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Añadir Contacto
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Contactos</p>
                <p className="text-2xl font-bold">{contacts.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clientes</p>
                <p className="text-2xl font-bold">
                  {contacts.filter(c => c.type === 'client').length}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Asesores</p>
                <p className="text-2xl font-bold">
                  {contacts.filter(c => c.type === 'advisor').length}
                </p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Legales</p>
                <p className="text-2xl font-bold">
                  {contacts.filter(c => c.type === 'legal').length}
                </p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Contactos */}
      <Card>
        <CardHeader>
          <CardTitle>Contactos</CardTitle>
          <CardDescription>
            Lista de todas las personas involucradas en este mandato
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarFallback>
                      {getInitials(contact.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{contact.name}</h4>
                      <Badge className={getContactTypeColor(contact.type)}>
                        {getContactTypeLabel(contact.type)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{contact.role}</p>
                    <p className="text-sm text-muted-foreground">{contact.company}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center text-sm text-muted-foreground mb-1">
                      <Mail className="h-3 w-3 mr-1" />
                      {contact.email}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="h-3 w-3 mr-1" />
                      {contact.phone}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};