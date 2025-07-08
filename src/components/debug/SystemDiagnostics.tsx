import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Database, 
  Globe, 
  Users, 
  Building, 
  FileText,
  Mail,
  Search,
  BarChart3,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  details?: string;
  timestamp: string;
}

export const SystemDiagnostics = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const addResult = (result: Omit<TestResult, 'timestamp'>) => {
    setTestResults(prev => [...prev, { ...result, timestamp: new Date().toISOString() }]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  // Test database connectivity
  const testDatabase = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('count(*)')
        .limit(1);
      
      if (error) throw error;
      
      addResult({
        name: 'Conectividad de Base de Datos',
        status: 'success',
        message: 'Conexión exitosa a Supabase',
        details: `Query ejecutada correctamente`
      });
    } catch (error) {
      addResult({
        name: 'Conectividad de Base de Datos',
        status: 'error',
        message: 'Error de conexión a la base de datos',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  // Test authentication
  const testAuth = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      
      if (user) {
        addResult({
          name: 'Autenticación',
          status: 'success',
          message: 'Usuario autenticado correctamente',
          details: `Usuario: ${user.email}`
        });
      } else {
        addResult({
          name: 'Autenticación',
          status: 'warning',
          message: 'No hay usuario autenticado',
          details: 'Es posible que el usuario no esté logueado'
        });
      }
    } catch (error) {
      addResult({
        name: 'Autenticación',
        status: 'error',
        message: 'Error en el sistema de autenticación',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  // Test main tables
  const testTables = async () => {
    const tableNames = ['companies', 'contacts', 'leads', 'deals', 'buying_mandates'] as const;
    
    for (const tableName of tableNames) {
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (error) throw error;
        
        addResult({
          name: `Tabla: ${tableName}`,
          status: 'success',
          message: `Tabla accesible`,
          details: `${count} registros encontrados`
        });
      } catch (error) {
        addResult({
          name: `Tabla: ${tableName}`,
          status: 'error',
          message: `Error accediendo a tabla ${tableName}`,
          details: error instanceof Error ? error.message : 'Error desconocido'
        });
      }
    }
  };

  // Test edge functions
  const testEdgeFunctions = async () => {
    const functions = [
      { name: 'einforma-test-connection', testData: {} },
      { name: 'company-lookup-einforma', testData: { nif: 'B12345678' } }
    ];

    for (const func of functions) {
      try {
        const { data, error } = await supabase.functions.invoke(func.name, {
          body: func.testData
        });
        
        if (error) throw error;
        
        addResult({
          name: `Edge Function: ${func.name}`,
          status: 'success',
          message: 'Función ejecutada correctamente',
          details: `Respuesta: ${JSON.stringify(data).substring(0, 100)}...`
        });
      } catch (error) {
        addResult({
          name: `Edge Function: ${func.name}`,
          status: 'error',
          message: `Error ejecutando ${func.name}`,
          details: error instanceof Error ? error.message : 'Error desconocido'
        });
      }
    }
  };

  // Test permissions
  const testPermissions = async () => {
    try {
      // Test read permissions
      const { data: readTest, error: readError } = await supabase
        .from('companies')
        .select('id')
        .limit(1);
      
      if (readError) throw new Error(`Read test failed: ${readError.message}`);
      
      // Test write permissions (attempt to insert then delete)
      const testCompany = {
        name: 'TEST_COMPANY_DELETE_ME',
        company_size: '1-10' as const,
        company_type: 'prospect' as const,
        company_status: 'prospecto' as const,
        lifecycle_stage: 'lead' as const
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('companies')
        .insert(testCompany)
        .select()
        .single();
      
      if (insertError) throw new Error(`Insert test failed: ${insertError.message}`);
      
      // Clean up test data
      if (insertData) {
        await supabase
          .from('companies')
          .delete()
          .eq('id', insertData.id);
      }
      
      addResult({
        name: 'Permisos de Usuario',
        status: 'success',
        message: 'Permisos de lectura y escritura funcionando',
        details: 'CRUD operations ejecutadas correctamente'
      });
      
    } catch (error) {
      addResult({
        name: 'Permisos de Usuario',
        status: 'error',
        message: 'Error en permisos de usuario',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  // Run all tests
  const runAllTests = async () => {
    setIsRunning(true);
    clearResults();
    
    toast({
      title: "Iniciando diagnóstico",
      description: "Ejecutando pruebas del sistema...",
    });

    await testAuth();
    await testDatabase();
    await testTables();
    await testPermissions();
    await testEdgeFunctions();
    
    setIsRunning(false);
    
    toast({
      title: "Diagnóstico completado",
      description: "Revisa los resultados abajo",
    });
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <RefreshCw className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'default';
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'outline';
    }
  };

  const successCount = testResults.filter(r => r.status === 'success').length;
  const errorCount = testResults.filter(r => r.status === 'error').length;
  const warningCount = testResults.filter(r => r.status === 'warning').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Diagnóstico del Sistema</h2>
          <p className="text-muted-foreground">
            Prueba y verifica todas las funcionalidades principales
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={clearResults} variant="outline" size="sm">
            Limpiar
          </Button>
          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            className="min-w-[120px]"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Ejecutando...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Ejecutar Todas
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Summary */}
      {testResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{successCount}</div>
              <p className="text-sm text-muted-foreground">Exitosas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
              <p className="text-sm text-muted-foreground">Errores</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
              <p className="text-sm text-muted-foreground">Advertencias</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{testResults.length}</div>
              <p className="text-sm text-muted-foreground">Total</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Test Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button variant="outline" onClick={testAuth} disabled={isRunning}>
          <Users className="h-4 w-4 mr-2" />
          Auth
        </Button>
        <Button variant="outline" onClick={testDatabase} disabled={isRunning}>
          <Database className="h-4 w-4 mr-2" />
          Base de Datos
        </Button>
        <Button variant="outline" onClick={testTables} disabled={isRunning}>
          <FileText className="h-4 w-4 mr-2" />
          Tablas
        </Button>
        <Button variant="outline" onClick={testEdgeFunctions} disabled={isRunning}>
              <Globe className="h-4 w-4 mr-2" />
          Edge Functions
        </Button>
      </div>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>Resultados de las Pruebas</CardTitle>
          <CardDescription>
            Estado de cada componente del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {testResults.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                No hay resultados aún. Ejecuta las pruebas para ver el estado del sistema.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div 
                  key={index} 
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{result.name}</h4>
                        <Badge variant={getStatusColor(result.status)}>
                          {result.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {result.message}
                      </p>
                      {result.details && (
                        <p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
                          {result.details}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(result.timestamp).toLocaleTimeString('es-ES')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Acciones comunes de debugging y mantenimiento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reiniciar Cache
            </Button>
            <Button variant="outline" className="justify-start">
              <Database className="h-4 w-4 mr-2" />
              Verificar RLS
            </Button>
            <Button variant="outline" className="justify-start">
              <Globe className="h-4 w-4 mr-2" />
              Probar APIs
            </Button>
            <Button variant="outline" className="justify-start">
              <Mail className="h-4 w-4 mr-2" />
              Test Email
            </Button>
            <Button variant="outline" className="justify-start">
              <Settings className="h-4 w-4 mr-2" />
              Verificar Config
            </Button>
            <Button variant="outline" className="justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Exportar Logs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};