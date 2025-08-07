import React, { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Upload, Download } from 'lucide-react';
import { Company } from '@/types/Company';

// Lazy imports for performance
const CompanyFilesTab = React.lazy(() => 
  import('@/components/companies/CompanyFilesTab').then(module => ({ default: module.CompanyFilesTab }))
);

const CompanyDocumentsTab = React.lazy(() => 
  import('@/components/companies/CompanyDocumentsTab').then(module => ({ default: module.CompanyDocumentsTab }))
);

interface CompanyAllDocumentsTabProps {
  company: Company;
}

const LoadingSkeleton = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-2">
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
          <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
        </div>
      ))}
    </div>
  </div>
);

export const CompanyAllDocumentsTab = ({ company }: CompanyAllDocumentsTabProps) => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Upload className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">--</p>
                <p className="text-sm text-muted-foreground">Archivos Subidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">--</p>
                <p className="text-sm text-muted-foreground">Documentos Generados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Download className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">--</p>
                <p className="text-sm text-muted-foreground">Descargas Totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para diferentes tipos de documentos */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Documentos</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="files" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="files" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Archivos Subidos
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documentos Generados
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="files" className="mt-6">
              <Suspense fallback={<LoadingSkeleton />}>
                <CompanyFilesTab company={company} />
              </Suspense>
            </TabsContent>
            
            <TabsContent value="documents" className="mt-6">
              <Suspense fallback={<LoadingSkeleton />}>
                <CompanyDocumentsTab company={company} />
              </Suspense>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};