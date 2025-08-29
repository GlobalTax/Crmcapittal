import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, Edit, Check, X, ExternalLink } from 'lucide-react';
import { MandateTarget } from '@/types/BuyingMandate';
import { useBuyingMandates } from '@/hooks/useBuyingMandates';
import { logger } from '@/utils/productionLogger';

interface TargetContactSectionProps {
  target: MandateTarget;
  onUpdate: (target: MandateTarget) => void;
}

export const TargetContactSection = ({ target, onUpdate }: TargetContactSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    contact_name: target.contact_name || '',
    contact_email: target.contact_email || '',
    contact_phone: target.contact_phone || '',
  });
  
  const { updateTarget } = useBuyingMandates();

  const handleSave = async () => {
    try {
      await updateTarget(target.id, editData);
      setIsEditing(false);
      onUpdate({ ...target, ...editData });
    } catch (error) {
      logger.error('Error updating target contact', { error, targetId: target.id }, 'TargetContactSection');
    }
  };

  const handleCancel = () => {
    setEditData({
      contact_name: target.contact_name || '',
      contact_email: target.contact_email || '',
      contact_phone: target.contact_phone || '',
    });
    setIsEditing(false);
  };

  const handleEmailContact = () => {
    if (target.contact_email) {
      window.open(`mailto:${target.contact_email}`, '_blank');
    }
  };

  const handlePhoneContact = () => {
    if (target.contact_phone) {
      window.open(`tel:${target.contact_phone}`, '_blank');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Información de Contacto
        </CardTitle>
        {!isEditing && (
          <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="contact_name">Nombre del Contacto</Label>
              <Input
                id="contact_name"
                value={editData.contact_name}
                onChange={(e) => setEditData(prev => ({ ...prev, contact_name: e.target.value }))}
                placeholder="Nombre completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_email">Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={editData.contact_email}
                onChange={(e) => setEditData(prev => ({ ...prev, contact_email: e.target.value }))}
                placeholder="email@empresa.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_phone">Teléfono</Label>
              <Input
                id="contact_phone"
                value={editData.contact_phone}
                onChange={(e) => setEditData(prev => ({ ...prev, contact_phone: e.target.value }))}
                placeholder="+34 xxx xxx xxx"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button size="sm" onClick={handleSave}>
                <Check className="h-4 w-4 mr-2" />
                Guardar
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="font-medium">{target.contact_name || 'Sin contacto asignado'}</div>
                  {target.contact_name && (
                    <div className="text-sm text-muted-foreground">Contacto principal</div>
                  )}
                </div>
              </div>

              {target.contact_email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div className="flex-1">
                    <div className="font-medium">{target.contact_email}</div>
                    <div className="text-sm text-muted-foreground">Email principal</div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={handleEmailContact}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Enviar
                  </Button>
                </div>
              )}

              {target.contact_phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div className="flex-1">
                    <div className="font-medium">{target.contact_phone}</div>
                    <div className="text-sm text-muted-foreground">Teléfono principal</div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={handlePhoneContact}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Llamar
                  </Button>
                </div>
              )}
            </div>

            {(!target.contact_name && !target.contact_email && !target.contact_phone) && (
              <div className="text-center py-4 text-muted-foreground">
                <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No hay información de contacto</p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => setIsEditing(true)}
                >
                  Añadir Contacto
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};