import React, { useState } from 'react';
import { BuyingMandate } from '@/types/BuyingMandate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Building2, MapPin, Euro, Phone, Mail, Calendar, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MandateTargetsTabProps {
  mandate: BuyingMandate;
}

export const MandateTargetsTab = ({ mandate }: MandateTargetsTabProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Mock data - in real app this would come from the mandate targets
  const mockTargets = [
    {
      id: '1',
      company_name: 'Tech Solutions S.L.',
      sector: 'Tecnología',
      location: 'Madrid',
      revenues: 2500000,
      ebitda: 400000,
      contact_name: 'María García',
      contact_email: 'maria@techsolutions.es',
      contact_phone: '+34 600 123 456',
      status: 'pending',
      contacted: false,
      notes: 'Empresa especializada en desarrollo de software para PYMES'
    },
    {
      id: '2',
      company_name: 'Industrial Partners',
      sector: 'Industrial',
      location: 'Barcelona',
      revenues: 5000000,
      ebitda: 800000,
      contact_name: 'Juan Martínez',
      contact_email: 'juan@industrialpartners.es',
      contact_phone: '+34 610 987 654',
      status: 'contacted',
      contacted: true,
      contact_date: '2024-01-15',
      notes: 'Primera reunión programada para la próxima semana'
    },
    {
      id: '3',
      company_name: 'Green Energy Co.',
      sector: 'Energías Renovables',
      location: 'Valencia',
      revenues: 3200000,
      ebitda: 500000,
      contact_name: 'Ana Ruiz',
      contact_email: 'ana@greenenergy.es',
      contact_phone: '+34 620 456 789',
      status: 'interested',
      contacted: true,
      contact_date: '2024-01-10',
      notes: 'Muy interesados, esperando documentación adicional'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: amount > 999999 ? 'compact' : 'standard'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any; color: string }> = {
      'pending': { label: 'Pendiente', variant: 'secondary', color: 'bg-gray-100 text-gray-600' },
      'contacted': { label: 'Contactado', variant: 'outline', color: 'bg-blue-100 text-blue-600' },
      'in_analysis': { label: 'En Análisis', variant: 'default', color: 'bg-yellow-100 text-yellow-600' },
      'interested': { label: 'Interesado', variant: 'default', color: 'bg-green-100 text-green-600' },
      'nda_signed': { label: 'NDA Firmado', variant: 'default', color: 'bg-purple-100 text-purple-600' },
      'rejected': { label: 'Rechazado', variant: 'destructive', color: 'bg-red-100 text-red-600' },
      'closed': { label: 'Cerrado', variant: 'outline', color: 'bg-gray-100 text-gray-600' },
    };
    
    const config = statusConfig[status] || statusConfig['pending'];
    return (
      <Badge className={`text-xs ${config.color}`}>
        {config.label}
      </Badge>
    );
  };

  const filteredTargets = mockTargets.filter(target => {
    const matchesSearch = target.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         target.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         target.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || target.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: mockTargets.length,
    pending: mockTargets.filter(t => t.status === 'pending').length,
    contacted: mockTargets.filter(t => t.status === 'contacted').length,
    interested: mockTargets.filter(t => t.status === 'interested').length,
    rejected: mockTargets.filter(t => t.status === 'rejected').length
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Empresas Objetivo</h2>
          <p className="text-sm text-muted-foreground">
            Gestiona las empresas objetivo para este mandato de compra
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Añadir Empresa
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar empresas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Status Tabs */}
      <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">
            Todas ({statusCounts.all})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pendientes ({statusCounts.pending})
          </TabsTrigger>
          <TabsTrigger value="contacted">
            Contactadas ({statusCounts.contacted})
          </TabsTrigger>
          <TabsTrigger value="interested">
            Interesadas ({statusCounts.interested})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rechazadas ({statusCounts.rejected})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedStatus} className="mt-6">
          {/* Targets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTargets.map((target) => (
              <Card key={target.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{target.company_name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Building2 className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{target.sector}</span>
                      </div>
                    </div>
                    {getStatusBadge(target.status)}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Location */}
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{target.location}</span>
                  </div>

                  {/* Financial Info */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Facturación</p>
                      <p className="text-sm font-medium">{formatCurrency(target.revenues)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">EBITDA</p>
                      <p className="text-sm font-medium">{formatCurrency(target.ebitda)}</p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  {target.contact_name && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{target.contact_name}</span>
                      </div>
                      <div className="flex gap-2">
                        {target.contact_email && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={`mailto:${target.contact_email}`}>
                              <Mail className="h-3 w-3" />
                            </a>
                          </Button>
                        )}
                        {target.contact_phone && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={`tel:${target.contact_phone}`}>
                              <Phone className="h-3 w-3" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contact Date */}
                  {target.contact_date && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Contactado el {new Date(target.contact_date).toLocaleDateString('es-ES')}</span>
                    </div>
                  )}

                  {/* Notes */}
                  {target.notes && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground">{target.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <FileText className="h-3 w-3 mr-1" />
                      Ver Detalles
                    </Button>
                    <Button size="sm" className="flex-1">
                      {target.contacted ? 'Seguimiento' : 'Contactar'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTargets.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No se encontraron empresas</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm 
                  ? "Intenta con otros términos de búsqueda" 
                  : "Añade empresas objetivo para comenzar el seguimiento"
                }
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Añadir Primera Empresa
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};