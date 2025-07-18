import React from 'react';
import { FileImage, Plus, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTeasers } from '@/hooks/useTeasers';

export default function TeaserBuilder() {
  const { teasers, loading, error, createTeaser } = useTeasers();

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
        <Button onClick={() => createTeaser({
          title: 'Nuevo Teaser',
          transaction_id: 'temp-' + Date.now(),
          anonymous_company_name: 'Nueva Empresa'
        })}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Teaser
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
                Comienza creando tu primer teaser de inversión
              </p>
              <Button onClick={() => createTeaser({
                title: 'Primer Teaser',
                transaction_id: 'temp-' + Date.now(),
                anonymous_company_name: 'Nueva Empresa'
              })}>
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