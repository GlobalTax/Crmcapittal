
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileImage, Download, Eye, Share } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function TeaserBuilder() {
  const [selectedTemplate, setSelectedTemplate] = useState('modern');

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teaser Builder</h1>
          <p className="text-muted-foreground">
            Crea presentaciones profesionales para oportunidades de inversión
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Teaser
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teasers Creados</CardTitle>
            <FileImage className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Descargas</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visualizaciones</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.1k</div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compartidos</CardTitle>
            <Share className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">Enlaces</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Crear Nuevo Teaser</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Nombre de la Empresa</Label>
                  <Input id="company-name" placeholder="Ej: TechCorp Solutions" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sector">Sector</Label>
                  <Input id="sector" placeholder="Ej: Tecnología" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descripción del Negocio</Label>
                <Textarea 
                  id="description" 
                  placeholder="Breve descripción de la empresa y su propuesta de valor..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="revenue">Facturación (€)</Label>
                  <Input id="revenue" placeholder="2.500.000" type="number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ebitda">EBITDA (€)</Label>
                  <Input id="ebitda" placeholder="450.000" type="number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employees">Empleados</Label>
                  <Input id="employees" placeholder="25" type="number" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="highlights">Puntos Destacados</Label>
                <Textarea 
                  id="highlights" 
                  placeholder="• Cliente recurrente del 95%&#10;• Tecnología propietaria&#10;• Crecimiento sostenido últimos 3 años"
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  Vista Previa
                </Button>
                <Button variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Generar PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Templates */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Plantillas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { id: 'modern', name: 'Moderna', description: 'Diseño limpio y profesional' },
                { id: 'classic', name: 'Clásica', description: 'Estilo tradicional corporativo' },
                { id: 'minimal', name: 'Minimalista', description: 'Enfoque en contenido esencial' }
              ].map((template) => (
                <div 
                  key={template.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedTemplate === template.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <h4 className="font-medium">{template.name}</h4>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Teasers Recientes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                'TechCorp Solutions',
                'Industria Verde SA',
                'RetailMax Group'
              ].map((company, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <span className="text-sm">{company}</span>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
