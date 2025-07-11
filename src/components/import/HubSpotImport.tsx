import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Download, Building2, Users, Handshake } from 'lucide-react';

interface ImportResults {
  companies: number;
  contacts: number;
  deals: number;
  errors: string[];
}

export function HubSpotImport() {
  const [isImporting, setIsImporting] = useState(false);
  const [results, setResults] = useState<ImportResults | null>(null);
  const { toast } = useToast();

  const handleImport = async (importType: 'all' | 'companies' | 'contacts' | 'deals') => {
    setIsImporting(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke('hubspot-import', {
        body: { importType }
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        setResults(data.results);
        toast({
          title: "Importación completada",
          description: `Se importaron ${data.results.companies + data.results.contacts + data.results.deals} registros exitosamente.`,
        });
      } else {
        throw new Error(data.error || 'Error desconocido');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Error en la importación",
        description: error.message || "No se pudo completar la importación",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Importar desde HubSpot
          </CardTitle>
          <CardDescription>
            Importa tus contactos, empresas y deals desde HubSpot directamente a tu CRM.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={() => handleImport('all')}
              disabled={isImporting}
              className="h-20 flex-col gap-2"
              variant="outline"
            >
              {isImporting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Download className="h-5 w-5" />
              )}
              <span>Importar Todo</span>
            </Button>

            <Button
              onClick={() => handleImport('companies')}
              disabled={isImporting}
              className="h-20 flex-col gap-2"
              variant="outline"
            >
              {isImporting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Building2 className="h-5 w-5" />
              )}
              <span>Solo Empresas</span>
            </Button>

            <Button
              onClick={() => handleImport('contacts')}
              disabled={isImporting}
              className="h-20 flex-col gap-2"
              variant="outline"
            >
              {isImporting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Users className="h-5 w-5" />
              )}
              <span>Solo Contactos</span>
            </Button>

            <Button
              onClick={() => handleImport('deals')}
              disabled={isImporting}
              className="h-20 flex-col gap-2"
              variant="outline"
            >
              {isImporting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Handshake className="h-5 w-5" />
              )}
              <span>Solo Deals</span>
            </Button>
          </div>

          {results && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Resultados de la Importación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{results.companies}</div>
                    <div className="text-sm text-muted-foreground">Empresas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{results.contacts}</div>
                    <div className="text-sm text-muted-foreground">Contactos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{results.deals}</div>
                    <div className="text-sm text-muted-foreground">Deals</div>
                  </div>
                </div>

                {results.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-destructive">Errores encontrados:</h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {results.errors.map((error, index) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {error}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {results.errors.length === 0 && (results.companies > 0 || results.contacts > 0 || results.deals > 0) && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-green-800 text-sm">✅ Importación completada exitosamente sin errores</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}