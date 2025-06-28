
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Download, 
  Upload, 
  Trash2, 
  Edit, 
  Tag, 
  Users,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useAdvancedContacts } from '@/hooks/useAdvancedContacts';
import { Contact } from '@/types/Contact';

interface BulkContactOperationsProps {
  selectedContacts: Contact[];
  onSelectionChange: (contacts: Contact[]) => void;
  onBulkComplete: () => void;
}

export const BulkContactOperations = ({ 
  selectedContacts, 
  onSelectionChange, 
  onBulkComplete 
}: BulkContactOperationsProps) => {
  const { bulkUpdateContacts, exportContacts } = useAdvancedContacts();
  const [loading, setLoading] = useState(false);
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  const [bulkUpdates, setBulkUpdates] = useState({
    contact_priority: '',
    contact_source: '',
    is_active: '',
    sectors_of_interest: [] as string[],
  });

  const handleBulkUpdate = async () => {
    if (selectedContacts.length === 0) return;

    try {
      setLoading(true);
      
      // Preparar updates (filtrar valores vacíos)
      const updates: any = {};
      if (bulkUpdates.contact_priority) updates.contact_priority = bulkUpdates.contact_priority;
      if (bulkUpdates.contact_source) updates.contact_source = bulkUpdates.contact_source;
      if (bulkUpdates.is_active !== '') updates.is_active = bulkUpdates.is_active === 'true';
      if (bulkUpdates.sectors_of_interest.length > 0) updates.sectors_of_interest = bulkUpdates.sectors_of_interest;

      if (Object.keys(updates).length === 0) {
        alert('Selecciona al menos un campo para actualizar');
        return;
      }

      const contactIds = selectedContacts.map(c => c.id);
      await bulkUpdateContacts(contactIds, updates);
      
      onBulkComplete();
      setShowBulkUpdate(false);
      setBulkUpdates({
        contact_priority: '',
        contact_source: '',
        is_active: '',
        sectors_of_interest: [],
      });
    } catch (error) {
      console.error('Error in bulk update:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      setLoading(true);
      await exportContacts(format);
    } catch (error) {
      console.error('Error exporting:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Implementar lógica de importación
        console.log('Importing file:', file.name);
        // TODO: Implementar parseo y validación de archivo
      }
    };
    input.click();
  };

  if (selectedContacts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Operaciones Masivas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Selecciona contactos</h3>
            <p className="text-gray-600 mb-4">
              Selecciona uno o más contactos para realizar operaciones masivas
            </p>
            
            {/* Herramientas de importación/exportación */}
            <div className="flex justify-center space-x-2">
              <Button variant="outline" onClick={() => handleExport('csv')}>
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
              <Button variant="outline" onClick={() => handleExport('json')}>
                <Download className="h-4 w-4 mr-2" />
                Exportar JSON
              </Button>
              <Button variant="outline" onClick={handleImport}>
                <Upload className="h-4 w-4 mr-2" />
                Importar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Operaciones Masivas</span>
            <Badge variant="secondary">{selectedContacts.length} seleccionados</Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelectionChange([])}
          >
            Deseleccionar Todo
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Acciones rápidas */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBulkUpdate(!showBulkUpdate)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Actualizar Masivo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
            disabled={loading}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar Selección
          </Button>
          <Button
            variant="outline"
            size="sm"
          >
            <Tag className="h-4 w-4 mr-2" />
            Asignar Etiquetas
          </Button>
          <Button
            variant="destructive"
            size="sm"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>

        {/* Panel de actualización masiva */}
        {showBulkUpdate && (
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-lg">Actualización Masiva</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Prioridad */}
              <div>
                <label className="text-sm font-medium mb-2 block">Prioridad</label>
                <select
                  value={bulkUpdates.contact_priority}
                  onChange={(e) => setBulkUpdates({ 
                    ...bulkUpdates, 
                    contact_priority: e.target.value 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">No cambiar</option>
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              {/* Fuente */}
              <div>
                <label className="text-sm font-medium mb-2 block">Fuente de Contacto</label>
                <select
                  value={bulkUpdates.contact_source}
                  onChange={(e) => setBulkUpdates({ 
                    ...bulkUpdates, 
                    contact_source: e.target.value 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">No cambiar</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Referido">Referido</option>
                  <option value="Evento">Evento</option>
                  <option value="Web">Web</option>
                  <option value="Cold Call">Cold Call</option>
                </select>
              </div>

              {/* Estado activo */}
              <div>
                <label className="text-sm font-medium mb-2 block">Estado</label>
                <select
                  value={bulkUpdates.is_active}
                  onChange={(e) => setBulkUpdates({ 
                    ...bulkUpdates, 
                    is_active: e.target.value 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">No cambiar</option>
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowBulkUpdate(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleBulkUpdate}
                  disabled={loading}
                >
                  {loading ? 'Actualizando...' : 'Actualizar Contactos'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resumen de contactos seleccionados */}
        <Card className="bg-blue-50">
          <CardContent className="pt-4">
            <h4 className="font-medium mb-2">Contactos Seleccionados:</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {selectedContacts.slice(0, 5).map(contact => (
                <div key={contact.id} className="flex items-center justify-between text-sm">
                  <span>{contact.name}</span>
                  <Badge variant="outline">{contact.contact_type}</Badge>
                </div>
              ))}
              {selectedContacts.length > 5 && (
                <div className="text-sm text-gray-600 italic">
                  ... y {selectedContacts.length - 5} más
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Advertencias */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Importante</h4>
                <p className="text-sm text-yellow-700">
                  Las operaciones masivas no se pueden deshacer. 
                  Revisa cuidadosamente los cambios antes de aplicar.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};
