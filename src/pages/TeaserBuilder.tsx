import React, { useState } from 'react';
import { FileImage, Plus, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTeasers } from '@/hooks/useTeasers';
import { TransactionSelector } from '@/components/teaser/TransactionSelector';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function TeaserBuilder() {
  const { teasers, loading, error, createTeaser } = useTeasers();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTeaser, setNewTeaser] = useState({
    title: '',
    transaction_id: '',
    anonymous_company_name: ''
  });

  const handleCreateTeaser = async () => {
    if (!newTeaser.title || !newTeaser.transaction_id || !newTeaser.anonymous_company_name) {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor, completa todos los campos obligatorios',
        variant: 'destructive'
      });
      return;
    }

    try {
      await createTeaser({
        title: newTeaser.title,
        transaction_id: newTeaser.transaction_id,
        anonymous_company_name: newTeaser.anonymous_company_name,
        teaser_type: 'venta',
        status: 'borrador',
        currency: 'EUR'
      });
      
      toast({
        title: 'Teaser creado',
        description: 'El teaser se ha creado correctamente'
      });
      
      setShowCreateDialog(false);
      setNewTeaser({ title: '', transaction_id: '', anonymous_company_name: '' });
    } catch (error) {
      toast({
        title: 'Error al crear teaser',
        description: 'Ha ocurrido un error inesperado',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive mb-4">Error al cargar teasers</p>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Teaser Builder</h1>
          <p className="text-muted-foreground">
            Crea y gestiona teasers para oportunidades de inversión
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Teaser
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Teaser</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="teaser-title">Título del Teaser *</Label>
                <Input
                  id="teaser-title"
                  value={newTeaser.title}
                  onChange={(e) => setNewTeaser(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ej: Teaser - Empresa Tecnológica"
                />
              </div>
              
              <TransactionSelector
                value={newTeaser.transaction_id}
                onValueChange={(value) => setNewTeaser(prev => ({ ...prev, transaction_id: value }))}
              />
              
              <div className="space-y-2">
                <Label htmlFor="company-name">Nombre Anónimo de la Empresa *</Label>
                <Input
                  id="company-name"
                  value={newTeaser.anonymous_company_name}
                  onChange={(e) => setNewTeaser(prev => ({ ...prev, anonymous_company_name: e.target.value }))}
                  placeholder="Ej: TechCorp Innovación"
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateTeaser}>
                  Crear Teaser
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teasers</CardTitle>
            <FileImage className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teasers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teasers.filter(t => t.status === 'activo').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teasers.filter(t => t.status === 'completado').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teasers List */}
      <div className="space-y-4">
        {teasers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileImage className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay teasers</h3>
              <p className="text-muted-foreground text-center mb-4">
                Comienza creando tu primer teaser de inversión
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Teaser
              </Button>
            </CardContent>
          </Card>
        ) : (
          teasers.map((teaser) => (
            <Card key={teaser.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{teaser.anonymous_company_name || teaser.title}</CardTitle>
                    <CardDescription>
                      {teaser.sector && `Sector: ${teaser.sector}`}
                      {teaser.revenue && ` • Facturación: €${teaser.revenue.toLocaleString()}`}
                      {teaser.ebitda && ` • EBITDA: €${teaser.ebitda.toLocaleString()}`}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      teaser.status === 'completado' 
                        ? 'bg-green-100 text-green-800' 
                        : teaser.status === 'activo'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {teaser.status}
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {teaser.key_highlights && teaser.key_highlights.length > 0 && (
                <CardContent>
                  <p className="text-muted-foreground">{teaser.key_highlights.join(', ')}</p>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}