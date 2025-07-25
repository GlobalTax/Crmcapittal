import React, { useState } from 'react';
import { BuyingMandate } from '@/types/BuyingMandate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Edit, Save, X, Building2, User, Euro, Calendar, MapPin, Target } from 'lucide-react';

interface MandateDetailsSidebarProps {
  mandate: BuyingMandate;
  onUpdate?: (mandateId: string, updates: Partial<BuyingMandate>) => void;
}

export const MandateDetailsSidebar = ({ 
  mandate, 
  onUpdate 
}: MandateDetailsSidebarProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    mandate_name: mandate.mandate_name,
    client_name: mandate.client_name,
    client_contact: mandate.client_contact,
    client_email: mandate.client_email || '',
    client_phone: mandate.client_phone || '',
    other_criteria: mandate.other_criteria || '',
    status: mandate.status
  });

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'No especificado';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: amount > 999999 ? 'compact' : 'standard'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'active': 'bg-success-100 text-success-600',
      'paused': 'bg-warning-100 text-warning-600',
      'completed': 'bg-info-100 text-info-600',
      'cancelled': 'bg-error-100 text-error-600'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'active': 'Activo',
      'paused': 'Pausado', 
      'completed': 'Completado',
      'cancelled': 'Cancelado'
    };
    return labels[status] || status;
  };

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(mandate.id, editData);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      mandate_name: mandate.mandate_name,
      client_name: mandate.client_name,
      client_contact: mandate.client_contact,
      client_email: mandate.client_email || '',
      client_phone: mandate.client_phone || '',
      other_criteria: mandate.other_criteria || '',
      status: mandate.status
    });
    setIsEditing(false);
  };

  const formatRange = (min?: number, max?: number) => {
    if (min && max) return `${formatCurrency(min)} - ${formatCurrency(max)}`;
    if (min) return `Desde ${formatCurrency(min)}`;
    if (max) return `Hasta ${formatCurrency(max)}`;
    return 'No especificado';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Detalles del Mandato</h2>
        {!isEditing ? (
          <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" />
              Guardar
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
          </div>
        )}
      </div>

      {/* Status & Basic Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Estado y Información Básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div>
                <Label htmlFor="mandate_name" className="text-xs font-medium text-muted-foreground">
                  Nombre del Mandato
                </Label>
                <Input
                  id="mandate_name"
                  value={editData.mandate_name}
                  onChange={(e) => setEditData(prev => ({ ...prev, mandate_name: e.target.value }))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="status" className="text-xs font-medium text-muted-foreground">
                  Estado
                </Label>
                <Select
                  value={editData.status}
                  onValueChange={(value: any) => setEditData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="paused">Pausado</SelectItem>
                    <SelectItem value="completed">Completado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Estado</p>
                  <Badge className={`text-xs ${getStatusColor(mandate.status)}`}>
                    {getStatusLabel(mandate.status)}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Creado</p>
                  <p className="text-sm">
                    {new Date(mandate.created_at).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Client Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Información del Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div>
                <Label htmlFor="client_name" className="text-xs font-medium text-muted-foreground">
                  Nombre del Cliente
                </Label>
                <Input
                  id="client_name"
                  value={editData.client_name}
                  onChange={(e) => setEditData(prev => ({ ...prev, client_name: e.target.value }))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="client_contact" className="text-xs font-medium text-muted-foreground">
                  Contacto Principal
                </Label>
                <Input
                  id="client_contact"
                  value={editData.client_contact}
                  onChange={(e) => setEditData(prev => ({ ...prev, client_contact: e.target.value }))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="client_email" className="text-xs font-medium text-muted-foreground">
                  Email
                </Label>
                <Input
                  id="client_email"
                  type="email"
                  value={editData.client_email}
                  onChange={(e) => setEditData(prev => ({ ...prev, client_email: e.target.value }))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="client_phone" className="text-xs font-medium text-muted-foreground">
                  Teléfono
                </Label>
                <Input
                  id="client_phone"
                  value={editData.client_phone}
                  onChange={(e) => setEditData(prev => ({ ...prev, client_phone: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Cliente</p>
                  <p className="text-sm font-medium">{mandate.client_name}</p>
                </div>
              </div>
              
              <div>
                <p className="text-xs font-medium text-muted-foreground">Contacto Principal</p>
                <p className="text-sm">{mandate.client_contact}</p>
              </div>
              
              {mandate.client_email && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Email</p>
                  <a 
                    href={`mailto:${mandate.client_email}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {mandate.client_email}
                  </a>
                </div>
              )}
              
              {mandate.client_phone && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Teléfono</p>
                  <a 
                    href={`tel:${mandate.client_phone}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {mandate.client_phone}
                  </a>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Financial Criteria */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Criterios Financieros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Euro className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs font-medium text-muted-foreground">Facturación</p>
              <p className="text-sm">{formatRange(mandate.min_revenue, mandate.max_revenue)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Euro className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs font-medium text-muted-foreground">EBITDA</p>
              <p className="text-sm">{formatRange(mandate.min_ebitda, mandate.max_ebitda)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Criteria */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Criterios de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground">Sectores Objetivo</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {mandate.target_sectors.map((sector) => (
                  <Badge key={sector} variant="outline" className="text-xs">
                    {sector}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          {mandate.target_locations && mandate.target_locations.length > 0 && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground">Ubicaciones</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {mandate.target_locations.map((location) => (
                    <Badge key={location} variant="outline" className="text-xs">
                      {location}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Criteria */}
      {(mandate.other_criteria || isEditing) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Criterios Adicionales</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div>
                <Label htmlFor="other_criteria" className="text-xs font-medium text-muted-foreground">
                  Otros Criterios
                </Label>
                <Textarea
                  id="other_criteria"
                  value={editData.other_criteria}
                  onChange={(e) => setEditData(prev => ({ ...prev, other_criteria: e.target.value }))}
                  placeholder="Criterios adicionales de búsqueda..."
                  className="mt-1 min-h-[80px]"
                />
              </div>
            ) : (
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {mandate.other_criteria || 'Sin criterios adicionales'}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Información del Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Creado</p>
            <p className="text-xs text-foreground">
              {new Date(mandate.created_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          
          <div>
            <p className="text-xs font-medium text-muted-foreground">Última actualización</p>
            <p className="text-xs text-foreground">
              {new Date(mandate.updated_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          
          {mandate.assigned_user_name && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">Asignado a</p>
              <p className="text-xs text-foreground">{mandate.assigned_user_name}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};