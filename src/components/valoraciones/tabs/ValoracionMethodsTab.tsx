import React, { useState, useEffect } from 'react';
import { Valoracion } from '@/types/Valoracion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit2, Save, X, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ValoracionMethod {
  id: string;
  valoracion_id: string;
  metodo: string;
  resultado: number | null;
  confidence_level: number | null;
  comentario: string | null;
  created_at: string;
  updated_at: string;
}

interface ValoracionMethodsTabProps {
  valoracion: Valoracion;
}

export const ValoracionMethodsTab: React.FC<ValoracionMethodsTabProps> = ({ valoracion }) => {
  const [methods, setMethods] = useState<ValoracionMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    metodo: '',
    resultado: '',
    confidence_level: '',
    comentario: ''
  });

  useEffect(() => {
    fetchMethods();
  }, [valoracion.id]);

  const fetchMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('valoracion_methods')
        .select('*')
        .eq('valoracion_id', valoracion.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMethods(data || []);
    } catch (error) {
      console.error('Error fetching methods:', error);
      toast({ title: "Error", description: "No se pudieron cargar los métodos", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const methodData = {
        valoracion_id: valoracion.id,
        metodo: formData.metodo,
        resultado: formData.resultado ? parseFloat(formData.resultado) : null,
        confidence_level: formData.confidence_level ? parseFloat(formData.confidence_level) : null,
        comentario: formData.comentario || null
      };

      if (editingId) {
        const { error } = await supabase
          .from('valoracion_methods')
          .update(methodData)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('valoracion_methods')
          .insert([methodData]);
        if (error) throw error;
      }

      setFormData({ metodo: '', resultado: '', confidence_level: '', comentario: '' });
      setEditingId(null);
      setShowAddForm(false);
      fetchMethods();
      toast({ title: "Éxito", description: "Método guardado correctamente" });
    } catch (error) {
      console.error('Error saving method:', error);
      toast({ title: "Error", description: "No se pudo guardar el método", variant: "destructive" });
    }
  };

  const handleEdit = (method: ValoracionMethod) => {
    setFormData({
      metodo: method.metodo,
      resultado: method.resultado?.toString() || '',
      confidence_level: method.confidence_level?.toString() || '',
      comentario: method.comentario || ''
    });
    setEditingId(method.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('valoracion_methods')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      fetchMethods();
      toast({ title: "Éxito", description: "Método eliminado correctamente" });
    } catch (error) {
      console.error('Error deleting method:', error);
      toast({ title: "Error", description: "No se pudo eliminar el método", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({ metodo: '', resultado: '', confidence_level: '', comentario: '' });
    setEditingId(null);
    setShowAddForm(false);
  };

  if (loading) {
    return <div className="p-4">Cargando métodos...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Métodos de Valoración</h3>
        <Button onClick={() => setShowAddForm(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Método
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Editar' : 'Nuevo'} Método</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="metodo">Método</Label>
                <Input
                  id="metodo"
                  value={formData.metodo}
                  onChange={(e) => setFormData({ ...formData, metodo: e.target.value })}
                  placeholder="DCF, Múltiplos, etc."
                />
              </div>
              
              <div>
                <Label htmlFor="resultado">Resultado (€)</Label>
                <Input
                  id="resultado"
                  type="number"
                  value={formData.resultado}
                  onChange={(e) => setFormData({ ...formData, resultado: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="confidence_level">Nivel de Confianza (%)</Label>
              <Input
                id="confidence_level"
                type="number"
                min="0"
                max="100"
                value={formData.confidence_level}
                onChange={(e) => setFormData({ ...formData, confidence_level: e.target.value })}
                placeholder="85"
              />
            </div>

            <div>
              <Label htmlFor="comentario">Comentarios</Label>
              <Textarea
                id="comentario"
                value={formData.comentario}
                onChange={(e) => setFormData({ ...formData, comentario: e.target.value })}
                placeholder="Comentarios sobre la metodología..."
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

      {/* Methods List */}
      <div className="space-y-3">
        {methods.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No hay métodos de valoración registrados</p>
            </CardContent>
          </Card>
        ) : (
          methods.map((method) => (
            <Card key={method.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Método</label>
                      <p className="font-medium">{method.metodo}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Resultado</label>
                      <p className="font-semibold text-primary">
                        {method.resultado ? `€${method.resultado.toLocaleString()}` : 'N/A'}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Confianza</label>
                      <p>{method.confidence_level ? `${method.confidence_level}%` : 'N/A'}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Comentarios</label>
                      <p className="text-sm text-muted-foreground">
                        {method.comentario || 'Sin comentarios'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(method)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(method.id)}
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