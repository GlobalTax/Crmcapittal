import React from 'react';
import { Company } from '@/types/Company';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Building2, MapPin, Globe, Phone, Mail, Calendar } from 'lucide-react';

interface CompanyDetailModalProps {
  company: Company | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CompanyDetailModal = ({ company, open, onOpenChange }: CompanyDetailModalProps) => {
  if (!company) return null;

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const companyWithExtra = company as Company & { 
    opportunities_count?: number;
    contacts_count?: number;
    total_deal_value?: number;
    sector?: string;
    enrichment_data?: any;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-muted">
                {getInitials(company.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">{company.name}</div>
              <div className="text-sm text-muted-foreground font-normal">
                {companyWithExtra.sector || company.industry} • {company.company_size}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="deals">Deals</TabsTrigger>
            <TabsTrigger value="contactos">Contactos</TabsTrigger>
            <TabsTrigger value="actividad">Actividad</TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto h-full">
            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Datos Básicos */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Información Básica</h3>
                  
                  <div className="space-y-3">
                    {company.domain && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span>{company.domain}</span>
                      </div>
                    )}
                    
                    {(company.city || company.state) && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{[company.city, company.state].filter(Boolean).join(', ')}</span>
                      </div>
                    )}
                    
                    {company.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{company.phone}</span>
                      </div>
                    )}
                    
                    {company.founded_year && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Fundada en {company.founded_year}</span>
                      </div>
                    )}
                  </div>

                  {company.description && (
                    <div>
                      <h4 className="font-medium mb-2">Descripción</h4>
                      <p className="text-sm text-muted-foreground">{company.description}</p>
                    </div>
                  )}
                </div>

                {/* eInforma Widget Compacto */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Datos eInforma</h3>
                  
                  {companyWithExtra.enrichment_data ? (
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                      <div className="text-sm">
                        <span className="font-medium">Sector:</span>{' '}
                        <span className="text-muted-foreground">
                          {companyWithExtra.enrichment_data.sector || 'No disponible'}
                        </span>
                      </div>
                      
                      <div className="text-sm">
                        <span className="font-medium">Ingresos:</span>{' '}
                        <span className="text-muted-foreground">
                          {companyWithExtra.enrichment_data.revenue ? 
                            `€${companyWithExtra.enrichment_data.revenue.toLocaleString()}` : 
                            'No disponible'
                          }
                        </span>
                      </div>
                      
                      <div className="text-sm">
                        <span className="font-medium">Empleados:</span>{' '}
                        <span className="text-muted-foreground">
                          {companyWithExtra.enrichment_data.employees || 'No disponible'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        Sin datos de eInforma disponibles
                      </p>
                      {company.nif && (
                        <p className="text-xs text-muted-foreground mt-1">
                          NIF: {company.nif}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="deals" className="space-y-4 mt-6">
              <h3 className="font-semibold text-lg">Deals Activos</h3>
              <div className="bg-muted/50 rounded-lg p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Lista de deals en desarrollo...
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {companyWithExtra.opportunities_count || 0} deals encontrados
                </p>
              </div>
            </TabsContent>

            <TabsContent value="contactos" className="space-y-4 mt-6">
              <h3 className="font-semibold text-lg">Contactos Clave</h3>
              <div className="bg-muted/50 rounded-lg p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Mini-tabla de contactos en desarrollo...
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {companyWithExtra.contacts_count || 0} contactos encontrados
                </p>
              </div>
            </TabsContent>

            <TabsContent value="actividad" className="space-y-4 mt-6">
              <h3 className="font-semibold text-lg">Timeline de Actividad</h3>
              <div className="bg-muted/50 rounded-lg p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Timeline de últimas acciones en desarrollo...
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Último contacto: {company.last_contact_date ? 
                    new Date(company.last_contact_date).toLocaleDateString() : 
                    'Sin registro'
                  }
                </p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};