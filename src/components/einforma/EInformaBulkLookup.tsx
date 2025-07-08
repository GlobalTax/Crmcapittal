import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, Download, FileText, CheckCircle, XCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { useCompanyLookup, CompanyData } from '@/hooks/useCompanyLookup';
import { toast } from 'sonner';

interface BulkLookupResult {
  nif: string;
  status: 'pending' | 'success' | 'error' | 'processing';
  company?: CompanyData;
  error?: string;
  source?: 'einforma' | 'simulated';
}

export const EInformaBulkLookup = () => {
  const [nifList, setNifList] = useState<string[]>([]);
  const [results, setResults] = useState<BulkLookupResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentProcessing, setCurrentProcessing] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { lookupCompany, validateNIF } = useCompanyLookup();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const lines = content.split('\n').map(line => line.trim()).filter(line => line);
      
      // Extract NIFs from CSV (assume first column or plain text)
      const extractedNifs: string[] = [];
      lines.forEach(line => {
        // Split by common delimiters and take the first valid-looking field
        const fields = line.split(/[,;\t]/);
        for (const field of fields) {
          const cleanField = field.trim().replace(/['"]/g, '');
          if (validateNIF(cleanField)) {
            extractedNifs.push(cleanField.toUpperCase());
            break; // Only take the first valid NIF per line
          }
        }
      });

      if (extractedNifs.length === 0) {
        toast.error('No se encontraron NIFs válidos en el archivo');
        return;
      }

      // Remove duplicates
      const uniqueNifs = [...new Set(extractedNifs)];
      setNifList(uniqueNifs);
      setResults(uniqueNifs.map(nif => ({ nif, status: 'pending' as const })));
      toast.success(`${uniqueNifs.length} NIFs cargados correctamente`);
    };

    reader.readAsText(file);
  };

  const processAllLookups = async () => {
    if (nifList.length === 0) return;

    setIsProcessing(true);
    setProgress(0);

    const updatedResults: BulkLookupResult[] = [...results];

    for (let i = 0; i < nifList.length; i++) {
      const nif = nifList[i];
      setCurrentProcessing(nif);
      
      // Update status to processing
      updatedResults[i] = { ...updatedResults[i], status: 'processing' };
      setResults([...updatedResults]);

      try {
        const result = await lookupCompany(nif);
        
        if (result.success && result.data) {
          updatedResults[i] = {
            ...updatedResults[i],
            status: 'success',
            company: result.data,
            source: result.source
          };
        } else {
          updatedResults[i] = {
            ...updatedResults[i],
            status: 'error',
            error: result.error || 'Empresa no encontrada'
          };
        }
      } catch (error) {
        updatedResults[i] = {
          ...updatedResults[i],
          status: 'error',
          error: 'Error de conexión'
        };
      }

      setResults([...updatedResults]);
      setProgress(((i + 1) / nifList.length) * 100);

      // Small delay to avoid overwhelming the API
      if (i < nifList.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    setIsProcessing(false);
    setCurrentProcessing('');
    
    const successful = updatedResults.filter(r => r.status === 'success').length;
    const failed = updatedResults.filter(r => r.status === 'error').length;
    
    toast.success(`Procesamiento completado: ${successful} exitosos, ${failed} fallidos`);
  };

  const exportResults = () => {
    if (results.length === 0) return;

    const csvContent = [
      'NIF,Estado,Razón Social,Dirección,Ciudad,Código Postal,Sector,Error',
      ...results.map(result => {
        const company = result.company;
        return [
          result.nif,
          result.status,
          company?.name || '',
          company?.address_street || '',
          company?.address_city || '',
          company?.address_postal_code || '',
          company?.business_sector || '',
          result.error || ''
        ].map(field => `"${field}"`).join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `einforma_bulk_results_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearResults = () => {
    setNifList([]);
    setResults([]);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusIcon = (status: BulkLookupResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing': return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>;
      default: return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: BulkLookupResult['status']) => {
    switch (status) {
      case 'success': return <Badge variant="default" className="text-green-700 bg-green-100">Éxito</Badge>;
      case 'error': return <Badge variant="destructive">Error</Badge>;
      case 'processing': return <Badge variant="secondary">Procesando...</Badge>;
      default: return <Badge variant="outline">Pendiente</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Búsqueda Masiva de Empresas
          </CardTitle>
          <CardDescription>
            Sube un archivo CSV o TXT con NIFs/CIFs para buscar múltiples empresas a la vez
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
              >
                <FileText className="h-4 w-4 mr-2" />
                Seleccionar Archivo
              </Button>
              
              {nifList.length > 0 && (
                <>
                  <Button
                    onClick={processAllLookups}
                    disabled={isProcessing}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Procesando...
                      </>
                    ) : (
                      'Iniciar Búsqueda Masiva'
                    )}
                  </Button>
                  
                  {results.some(r => r.status === 'success') && (
                    <Button variant="outline" onClick={exportResults}>
                      <Download className="h-4 w-4 mr-2" />
                      Exportar Resultados
                    </Button>
                  )}
                  
                  <Button variant="ghost" onClick={clearResults}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpiar
                  </Button>
                </>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />

            {nifList.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {nifList.length} NIFs cargados. Cada búsqueda consume un crédito de eInforma.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress Section */}
      {isProcessing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progreso de búsqueda</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
              {currentProcessing && (
                <p className="text-sm text-muted-foreground">
                  Procesando: {currentProcessing}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados de Búsqueda</CardTitle>
            <CardDescription>
              {results.filter(r => r.status === 'success').length} exitosos, {' '}
              {results.filter(r => r.status === 'error').length} fallidos, {' '}
              {results.filter(r => r.status === 'pending').length} pendientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estado</TableHead>
                    <TableHead>NIF/CIF</TableHead>
                    <TableHead>Razón Social</TableHead>
                    <TableHead>Ciudad</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead>Fuente</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(result.status)}
                          {getStatusBadge(result.status)}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{result.nif}</TableCell>
                      <TableCell>
                        {result.company?.name || (result.error ? 'N/A' : '-')}
                      </TableCell>
                      <TableCell>
                        {result.company?.address_city || '-'}
                      </TableCell>
                      <TableCell>
                        {result.company?.business_sector || '-'}
                      </TableCell>
                      <TableCell>
                        {result.source && (
                          <Badge variant="outline" className="text-xs">
                            {result.source === 'einforma' ? 'eInforma' : 'Simulado'}
                          </Badge>
                        )}
                        {result.error && (
                          <span className="text-xs text-red-600">{result.error}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};