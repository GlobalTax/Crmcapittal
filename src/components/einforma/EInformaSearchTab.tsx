import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  SearchIcon, 
  UploadIcon, 
  BuildingIcon, 
  ZapIcon,
  FileTextIcon,
  AlertTriangleIcon
} from 'lucide-react';
import { NifLookup } from '@/components/companies/NifLookup';
import { EInformaBulkLookup } from '@/components/einforma/EInformaBulkLookup';
import { EInformaQueryQueue } from '@/components/einforma/EInformaQueryQueue';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EInformaSearchTabProps {
  recentQueries: Array<{
    companyName: string;
    nif: string;
    status: 'success' | 'error';
    timestamp: string;
    cost: number;
  }>;
  onRefresh: () => void;
}

export const EInformaSearchTab = ({ recentQueries, onRefresh }: EInformaSearchTabProps) => {
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searchError, setSearchError] = useState<string>('');

  const handleCompanyFound = (company: any) => {
    setSearchResults({
      companyData: company,
      source: 'lookup'
    });
    setSearchError('');
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Smart Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SearchIcon className="h-5 w-5" />
            Búsqueda Inteligente
          </CardTitle>
          <CardDescription>
            Busca empresas por NIF/CIF o nombre con autocompletado CRM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Single Search */}
            <div className="space-y-4">
              <h4 className="font-medium">Búsqueda Individual</h4>
              <NifLookup onCompanyFound={handleCompanyFound} />
              
              {/* Smart Suggestions */}
              <Alert>
                <ZapIcon className="h-4 w-4" />
                <AlertDescription>
                  <strong>Sugerencia inteligente:</strong> Detectamos 12 empresas en tu CRM sin datos eInforma.
                  <Button variant="link" size="sm" className="ml-2 h-auto p-0">
                    Consultar todas ahora
                  </Button>
                </AlertDescription>
              </Alert>
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <h4 className="font-medium">Estado de Integración CRM</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">85%</div>
                  <p className="text-sm text-muted-foreground">Empresas con datos</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">12</div>
                  <p className="text-sm text-muted-foreground">Requieren consulta</p>
                </div>
              </div>
              
              <Button variant="outline" className="w-full">
                <BuildingIcon className="h-4 w-4 mr-2" />
                Ver empresas sin enriquecer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unified Bulk & Queue Management */}
      <Tabs defaultValue="bulk" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bulk">Búsqueda Masiva</TabsTrigger>
          <TabsTrigger value="queue">Cola de Procesamiento</TabsTrigger>
        </TabsList>

        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UploadIcon className="h-5 w-5" />
                Búsqueda Masiva Simplificada
              </CardTitle>
              <CardDescription>
                Arrastra un CSV o conecta directamente con empresas CRM
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EInformaBulkLookup />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queue">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileTextIcon className="h-5 w-5" />
                Cola de Procesamiento
              </CardTitle>
              <CardDescription>
                Monitorea el progreso de consultas en tiempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EInformaQueryQueue />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>
            Últimas consultas realizadas - integración en tiempo real
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentQueries.slice(0, 5).map((query, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <BuildingIcon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{query.companyName}</p>
                    <p className="text-sm text-muted-foreground">{query.nif}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-2">
                  <Badge variant={query.status === 'success' ? 'default' : 'destructive'}>
                    {query.status === 'success' ? 'Exitosa' : 'Error'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">€{query.cost.toFixed(2)}</span>
                </div>
              </div>
            ))}
            {recentQueries.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <SearchIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No hay consultas recientes</p>
                <p className="text-sm">Realiza tu primera búsqueda arriba</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};