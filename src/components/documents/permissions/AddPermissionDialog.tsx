import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useDocumentPermissions } from '@/hooks/useDocumentPermissions';
import { PermissionAssignment } from '@/types/DocumentPermissions';

interface AddPermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
}

export const AddPermissionDialog: React.FC<AddPermissionDialogProps> = ({
  open,
  onOpenChange,
  documentId,
}) => {
  const { grantPermission } = useDocumentPermissions();
  const [formData, setFormData] = useState({
    recipientType: 'user' as 'user' | 'team',
    recipientId: '',
    permissionType: 'viewer' as 'owner' | 'editor' | 'viewer' | 'commenter',
    expiresAt: undefined as Date | undefined,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.recipientId) return;

    setLoading(true);
    
    const assignment: PermissionAssignment = {
      permissionType: formData.permissionType,
      expiresAt: formData.expiresAt,
    };

    if (formData.recipientType === 'user') {
      assignment.userId = formData.recipientId;
    } else {
      assignment.teamId = formData.recipientId;
    }

    const result = await grantPermission(documentId, assignment);
    
    if (result) {
      onOpenChange(false);
      setFormData({
        recipientType: 'user',
        recipientId: '',
        permissionType: 'viewer',
        expiresAt: undefined,
      });
    }
    
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar Permiso</DialogTitle>
          <DialogDescription>
            Otorga acceso a este documento a un usuario o equipo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient-type">Tipo de destinatario</Label>
            <Select
              value={formData.recipientType}
              onValueChange={(value: 'user' | 'team') => 
                setFormData(prev => ({ ...prev, recipientType: value, recipientId: '' }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Usuario</SelectItem>
                <SelectItem value="team">Equipo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipient-id">
              {formData.recipientType === 'user' ? 'Email del usuario' : 'Nombre del equipo'}
            </Label>
            <Input
              id="recipient-id"
              placeholder={
                formData.recipientType === 'user' 
                  ? 'usuario@ejemplo.com' 
                  : 'Nombre del equipo'
              }
              value={formData.recipientId}
              onChange={(e) => setFormData(prev => ({ ...prev, recipientId: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="permission-type">Tipo de permiso</Label>
            <Select
              value={formData.permissionType}
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, permissionType: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Visor - Solo lectura</SelectItem>
                <SelectItem value="commenter">Comentarista - Lectura y comentarios</SelectItem>
                <SelectItem value="editor">Editor - Lectura y escritura</SelectItem>
                <SelectItem value="owner">Propietario - Control total</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Fecha de expiración (opcional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.expiresAt ? 
                    format(formData.expiresAt, 'PPP', { locale: es }) : 
                    'Sin expiración'
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.expiresAt}
                  onSelect={(date) => setFormData(prev => ({ ...prev, expiresAt: date }))}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
                {formData.expiresAt && (
                  <div className="p-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, expiresAt: undefined }))}
                    >
                      Quitar expiración
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!formData.recipientId || loading}
          >
            {loading ? 'Otorgando...' : 'Otorgar Permiso'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};