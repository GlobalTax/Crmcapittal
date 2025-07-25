import React, { useState, useEffect } from 'react';
import { Valoracion } from '@/types/Valoracion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Save, X, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ValoracionInput {
  id: string;
  valoracion_id: string;
  clave: string;
  valor: any;
  tipo_dato: string;
  obligatorio: boolean;
  descripcion: string | null;
  orden_display: number;
  validacion_reglas: any;
  created_at: string;
  updated_at: string;
}

interface ValoracionInputsTabProps {
  valoracion: Valoracion;
}

export const ValoracionInputsTab: React.FC<ValoracionInputsTabProps> = ({ valoracion }) => {
  const [inputs, setInputs] = useState<ValoracionInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    clave: '',
    valor: '',
    tipo_dato: 'text',
    obligatorio: false,
    descripcion: '',
    orden_display: 0
  });

  useEffect(() => {
    fetchInputs();
  }, [valoracion.id]);

  const fetchInputs = async () => {
    try {
      const { data, error } = await supabase
        .from('valoracion_inputs')
        .select('*')
        .eq('valoracion_id', valoracion.id)
        .order('orden_display', { ascending: true });

      if (error) throw error;
      setInputs(data || []);
    } catch (error) {
      console.error('Error fetching inputs:', error);
      toast({ title: "Error", description: "No se pudieron cargar los inputs", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const inputData = {
        valoracion_id: valoracion.id,
        clave: formData.clave,
        valor: formData.valor || null,
        tipo_dato: formData.tipo_dato,
        obligatorio: formData.obligatorio,
        descripcion: formData.descripcion || null,
        orden_display: formData.orden_display || inputs.length + 1
      };

      if (editingId) {
        const { error } = await supabase
          .from('valoracion_inputs')
          .update(inputData)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('valoracion_inputs')
          .insert([inputData]);
        if (error) throw error;
      }

      resetForm();
      fetchInputs();
      toast({ title: "Éxito", description: "Input guardado correctamente" });
    } catch (error) {
      console.error('Error saving input:', error);
      toast({ title: "Error", description: "No se pudo guardar el input", variant: "destructive" });
    }
  };

  const handleEdit = (input: ValoracionInput) => {
    setFormData({
      clave: input.clave,
      valor: input.valor?.toString() || '',
      tipo_dato: input.tipo_dato,
      obligatorio: input.obligatorio,
      descripcion: input.descripcion || '',
      orden_display: input.orden_display
    });
    setEditingId(input.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('valoracion_inputs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      fetchInputs();
      toast({ title: "Éxito", description: "Input eliminado correctamente" });
    } catch (error) {
      console.error('Error deleting input:', error);
      toast({ title: "Error", description: "No se pudo eliminar el input", variant: "destructive" });
    }
  };

  const handleValueUpdate = async (inputId: string, newValue: string) => {
    try {
      const { error } = await supabase
        .from('valoracion_inputs')
        .update({ valor: newValue })
        .eq('id', inputId);
      
      if (error) throw error;
      
      setInputs(prev => prev.map(input => 
        input.id === inputId ? { ...input, valor: newValue } : input
      ));
    } catch (error) {
      console.error('Error updating value:', error);
      toast({ title: "Error", description: "No se pudo actualizar el valor", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({
      clave: '',
      valor: '',
      tipo_dato: 'text',
      obligatorio: false,
      descripcion: '',
      orden_display: 0
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const renderInputField = (input: ValoracionInput) => {
    switch (input.tipo_dato) {
      case 'number':
        return (
          <Input
            type="number"
            value={input.valor || ''}
            onChange={(e) => handleValueUpdate(input.id, e.target.value)}
            placeholder="0"
          />
        );
      case 'currency':
        return (
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">€</span>
            <Input
              type="number"
              value={input.valor || ''}
              onChange={(e) => handleValueUpdate(input.id, e.target.value)}
              className="pl-8"
              placeholder="0"
            />
          </div>
        );
      case 'percentage':
        return (
          <div className="relative">
            <Input
              type="number"
              value={input.valor || ''}
              onChange={(e) => handleValueUpdate(input.id, e.target.value)}
              className="pr-8"
              placeholder="0"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
          </div>
        );
      case 'textarea':
        return (
          <Textarea
            value={input.valor || ''}
            onChange={(e) => handleValueUpdate(input.id, e.target.value)}
            placeholder={input.descripcion || ''}
          />
        );
      default:
        return (
          <Input
            value={input.valor || ''}
            onChange={(e) => handleValueUpdate(input.id, e.target.value)}
            placeholder={input.descripcion || ''}
          />
        );
    }
  };

  if (loading) {
    return <div className="p-4">Cargando inputs...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Inputs de Valoración</h3>
        <Button onClick={() => setShowAddForm(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Input
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Editar' : 'Nuevo'} Input</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clave">Clave</Label>
                <Input
                  id="clave"
                  value={formData.clave}
                  onChange={(e) => setFormData({ ...formData, clave: e.target.value })}
                  placeholder="revenue_2023"
                />
              </div>
              
              <div>
                <Label htmlFor="tipo_dato">Tipo de Dato</Label>
                <Select
                  value={formData.tipo_dato}
                  onValueChange={(value) => setFormData({ ...formData, tipo_dato: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Texto</SelectItem>
                    <SelectItem value="number">Número</SelectItem>
                    <SelectItem value="currency">Moneda</SelectItem>
                    <SelectItem value="percentage">Porcentaje</SelectItem>
                    <SelectItem value="textarea">Texto Largo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <Input
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Descripción del campo..."
              />
            </div>

            <div>
              <Label htmlFor="valor">Valor</Label>
              <Input
                id="valor"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                placeholder="Valor inicial..."
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </Button>
              <Button variant="outline" onClick={resetForm}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inputs List */}
      <div className="space-y-3">
        {inputs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No hay inputs registrados</p>
            </CardContent>
          </Card>
        ) : (
          inputs.map((input) => (
            <Card key={input.id}>
              <CardContent className="p-4">
                <div className="flex gap-4 items-start">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">{input.clave}</Label>
                      {input.obligatorio && (
                        <span className="text-destructive text-sm">*</span>
                      )}
                    </div>
                    {input.descripcion && (
                      <p className="text-sm text-muted-foreground">{input.descripcion}</p>
                    )}
                    {renderInputField(input)}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(input)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(input.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};