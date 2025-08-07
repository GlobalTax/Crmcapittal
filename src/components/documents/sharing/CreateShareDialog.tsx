import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useDocumentShares } from '@/hooks/useDocumentShares';
import { ShareLinkConfig } from '@/types/DocumentPermissions';

interface CreateShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
}

export const CreateShareDialog: React.FC<CreateShareDialogProps> = ({
  open,
  onOpenChange,
  documentId,
}) => {
  const { createShareLink } = useDocumentShares();
  const [formData, setFormData] = useState<ShareLinkConfig>({
    shareType: 'view',
    watermarkEnabled: false,
    downloadAllowed: true,
    printAllowed: true,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    
    const result = await createShareLink(documentId, formData);
    
    if (result) {
      onOpenChange(false);
      setFormData({
        shareType: 'view',
        watermarkEnabled: false,
        downloadAllowed: true,
        printAllowed: true,
      });
    }
    
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Enlace Compartido</DialogTitle>
          <DialogDescription>
            Configura las opciones de seguridad y acceso para el enlace
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="share-type">Tipo de acceso</Label>
            <Select
              value={formData.shareType}
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, shareType: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">Solo lectura</SelectItem>
                <SelectItem value="comment">Lectura y comentarios</SelectItem>
                <SelectItem value="edit">Lectura y escritura</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña (opcional)</Label>
            <Input
              id="password"
              type="password"
              placeholder="Dejar vacío para acceso libre"
              value={formData.password || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value || undefined }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-views">Máximo de visualizaciones (opcional)</Label>
            <Input
              id="max-views"
              type="number"
              placeholder="Sin límite"
              value={formData.maxViews || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                maxViews: e.target.value ? parseInt(e.target.value) : undefined 
              }))}
            />
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

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="watermark">Marca de agua</Label>
                <div className="text-sm text-muted-foreground">
                  Agregar marca de agua al documento
                </div>
              </div>
              <Switch
                id="watermark"
                checked={formData.watermarkEnabled}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, watermarkEnabled: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="download">Permitir descarga</Label>
                <div className="text-sm text-muted-foreground">
                  Los usuarios pueden descargar el documento
                </div>
              </div>
              <Switch
                id="download"
                checked={formData.downloadAllowed}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, downloadAllowed: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="print">Permitir impresión</Label>
                <div className="text-sm text-muted-foreground">
                  Los usuarios pueden imprimir el documento
                </div>
              </div>
              <Switch
                id="print"
                checked={formData.printAllowed}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, printAllowed: checked }))}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creando...' : 'Crear Enlace'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};