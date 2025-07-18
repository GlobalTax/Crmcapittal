import React, { useState } from 'react';
import { FileImage, Plus, Eye, Download, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTeasersForTransaction } from '@/hooks/useTeasersForTransaction';
import { TransaccionTeaserBuilder } from './TransaccionTeaserBuilder';

interface TransaccionTeaserTabProps {
  transaccion: any;
}

export function TransaccionTeaserTab({ transaccion }: TransaccionTeaserTabProps) {
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingTeaser, setEditingTeaser] = useState<any>(null);
  const { teasers, loading, error, createTeaser, deleteTeaser } = useTeasersForTransaction(transaccion.id);

  const handleCreateTeaser = () => {
    setEditingTeaser(null);
    setShowBuilder(true);
  };

  const handleEditTeaser = (teaser: any) => {
    setEditingTeaser(teaser);
    setShowBuilder(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">Error al cargar teasers</p>
        <p className="text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  if (showBuilder) {
    return (
      <TransaccionTeaserBuilder
        transaccion={transaccion}
        teaser={editingTeaser}
        onClose={() => setShowBuilder(false)}
        onSave={() => {
          setShowBuilder(false);
          setEditingTeaser(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Teasers de Venta</h2>
          <p className="text-muted-foreground">
            Crea perfiles ciegos para promover la venta de {transaccion.nombre_transaccion}
          </p>
        </div>
        <Button onClick={handleCreateTeaser}>
          <Plus className="w-4 h-4 mr-2" />
          Crear Teaser
        </Button>
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
                Crea el primer teaser para esta transacción y promociona la venta de forma anónima
              </p>
              <Button onClick={handleCreateTeaser}>
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
                    <CardTitle className="flex items-center gap-2">
                      <span>{teaser.anonymous_company_name || teaser.title}</span>
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        teaser.status === 'completado' 
                          ? 'bg-green-100 text-green-800' 
                          : teaser.status === 'activo'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {teaser.status}
                      </div>
                    </CardTitle>
                    <CardDescription>
                      {teaser.sector && `Sector: ${teaser.sector}`}
                      {teaser.revenue && ` • Facturación: €${teaser.revenue.toLocaleString()}`}
                      {teaser.ebitda && ` • EBITDA: €${teaser.ebitda.toLocaleString()}`}
                      {teaser.location && ` • Ubicación: ${teaser.location}`}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditTeaser(teaser)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => deleteTeaser(teaser.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {teaser.key_highlights && teaser.key_highlights.length > 0 && (
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Puntos Clave:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {teaser.key_highlights.map((highlight: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}