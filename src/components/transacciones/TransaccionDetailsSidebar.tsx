import React, { useState } from 'react';
import { Transaccion } from '@/types/Transaccion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Edit, Save, X, Building2, User, Euro, Calendar } from 'lucide-react';

interface TransaccionDetailsSidebarProps {
  transaccion: Transaccion;
  onUpdate: (transaccionId: string, updates: Partial<Transaccion>) => void;
}

export const TransaccionDetailsSidebar = ({ 
  transaccion, 
  onUpdate 
}: TransaccionDetailsSidebarProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    nombre_transaccion: transaccion.nombre_transaccion,
    valor_transaccion: transaccion.valor_transaccion?.toString() || '',
    prioridad: transaccion.prioridad,
    descripcion: transaccion.descripcion || '',
    notas: transaccion.notas || ''
  });

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'Sin valor';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: amount > 999999 ? 'compact' : 'standard'
    }).format(amount);
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'baja': 'bg-gray-100 text-gray-600',
      'media': 'bg-blue-100 text-blue-600',
      'alta': 'bg-orange-100 text-orange-600',
      'urgente': 'bg-red-100 text-red-600'
    };
    return colors[priority] || 'bg-gray-100 text-gray-600';
  };

  const handleSave = () => {
    const updates: Partial<Transaccion> = {
      nombre_transaccion: editData.nombre_transaccion,
      valor_transaccion: editData.valor_transaccion ? parseInt(editData.valor_transaccion) : undefined,
      prioridad: editData.prioridad,
      descripcion: editData.descripcion,
      notas: editData.notas
    };
    
    onUpdate(transaccion.id, updates);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      nombre_transaccion: transaccion.nombre_transaccion,
      valor_transaccion: transaccion.valor_transaccion?.toString() || '',
      prioridad: transaccion.prioridad,
      descripcion: transaccion.descripcion || '',
      notas: transaccion.notas || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Detalles de la Transacción</h2>
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

      {/* Basic Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Información Básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div>
                <Label htmlFor="nombre" className="text-xs font-medium text-muted-foreground">
                  Nombre de la Transacción
                </Label>
                <Input
                  id="nombre"
                  value={editData.nombre_transaccion}
                  onChange={(e) => setEditData(prev => ({ ...prev, nombre_transaccion: e.target.value }))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="valor" className="text-xs font-medium text-muted-foreground">
                  Valor (EUR)
                </Label>
                <Input
                  id="valor"
                  type="number"
                  value={editData.valor_transaccion}
                  onChange={(e) => setEditData(prev => ({ ...prev, valor_transaccion: e.target.value }))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="prioridad" className="text-xs font-medium text-muted-foreground">
                  Prioridad
                </Label>
                <Select
                  value={editData.prioridad}
                  onValueChange={(value) => setEditData(prev => ({ ...prev, prioridad: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baja">Baja</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Euro className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Valor</p>
                  <p className="text-sm font-medium">{formatCurrency(transaccion.valor_transaccion)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 flex items-center justify-center">
                  <Badge className={`text-xs ${getPriorityColor(transaccion.prioridad)}`}>
                    {transaccion.prioridad}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Prioridad</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Company & Contact */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Empresa y Contacto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs font-medium text-muted-foreground">Empresa</p>
              <p className="text-sm">{transaccion.company?.name || 'Sin empresa asignada'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs font-medium text-muted-foreground">Contacto</p>
              <p className="text-sm">{transaccion.contact?.name || 'Sin contacto asignado'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description & Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Descripción y Notas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div>
                <Label htmlFor="descripcion" className="text-xs font-medium text-muted-foreground">
                  Descripción
                </Label>
                <Textarea
                  id="descripcion"
                  value={editData.descripcion}
                  onChange={(e) => setEditData(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Describe la transacción..."
                  className="mt-1 min-h-[80px]"
                />
              </div>
              
              <div>
                <Label htmlFor="notas" className="text-xs font-medium text-muted-foreground">
                  Notas
                </Label>
                <Textarea
                  id="notas"
                  value={editData.notas}
                  onChange={(e) => setEditData(prev => ({ ...prev, notas: e.target.value }))}
                  placeholder="Notas adicionales..."
                  className="mt-1 min-h-[80px]"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Descripción</p>
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {transaccion.descripcion || 'Sin descripción'}
                </p>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-xs font-medium text-muted-foreground">Notas</p>
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {transaccion.notas || 'Sin notas'}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Información del Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Creada</p>
            <p className="text-xs text-foreground">
              {new Date(transaccion.created_at).toLocaleDateString('es-ES', {
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
              {new Date(transaccion.updated_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};