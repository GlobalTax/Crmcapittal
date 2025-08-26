import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Download, Building2, Users, Handshake } from 'lucide-react';
import { useHubSpotData } from '@/features/hubspot/hooks/useHubSpotData';

export function HubSpotImport() {
  const { importing, importResults, importData } = useHubSpotData();

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
              onClick={() => importData('all')}
              disabled={importing}
              className="h-20 flex-col gap-2"
              variant="outline"
            >
              {importing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Download className="h-5 w-5" />
              )}
              <span>Importar Todo</span>
            </Button>

            <Button
              onClick={() => importData('companies')}
              disabled={importing}
              className="h-20 flex-col gap-2"
              variant="outline"
            >
              {importing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Building2 className="h-5 w-5" />
              )}
              <span>Solo Empresas</span>
            </Button>

            <Button
              onClick={() => importData('contacts')}
              disabled={importing}
              className="h-20 flex-col gap-2"
              variant="outline"
            >
              {importing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Users className="h-5 w-5" />
              )}
              <span>Solo Contactos</span>
            </Button>

            <Button
              onClick={() => importData('deals')}
              disabled={importing}
              className="h-20 flex-col gap-2"
              variant="outline"
            >
              {importing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Handshake className="h-5 w-5" />
              )}
              <span>Solo Deals</span>
            </Button>
          </div>

          {importResults && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Resultados de la Importación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{importResults.companies}</div>
                    <div className="text-sm text-muted-foreground">Empresas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{importResults.contacts}</div>
                    <div className="text-sm text-muted-foreground">Contactos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{importResults.deals}</div>
                    <div className="text-sm text-muted-foreground">Deals</div>
                  </div>
                </div>

                {importResults.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-destructive">Errores encontrados:</h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {importResults.errors.map((error, index) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {error}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {importResults.errors.length === 0 && (importResults.companies > 0 || importResults.contacts > 0 || importResults.deals > 0) && (
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