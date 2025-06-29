
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  Settings, 
  Play, 
  Pause, 
  Plus, 
  Zap, 
  Target, 
  Mail,
  Calendar,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { useAutomation } from "@/hooks/useAutomation";
import { useCapitalMarket } from "@/hooks/useCapitalMarket";

const AutomationDashboard = () => {
  const { rules, isLoading, toggleRule, deleteRule } = useAutomation();
  const { syncStatus, syncFromCapitalMarket, testConnection, isSyncing, isTesting } = useCapitalMarket();
  const [selectedRule, setSelectedRule] = useState<string>('');

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'send_email': return <Mail className="h-4 w-4" />;
      case 'create_task': return <Calendar className="h-4 w-4" />;
      case 'move_stage': return <TrendingUp className="h-4 w-4" />;
      case 'notify_user': return <AlertTriangle className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Motor de Automatización</h2>
          <p className="text-muted-foreground">
            Gestiona reglas de automatización y la integración con Capital Market
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Regla
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reglas Activas</p>
                <p className="text-2xl font-semibold text-green-600">
                  {rules.filter(rule => rule.enabled).length}
                </p>
              </div>
              <Zap className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reglas</p>
                <p className="text-2xl font-semibold text-blue-600">
                  {rules.length}
                </p>
              </div>
              <Settings className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Última Sincronización</p>
                <p className="text-sm font-medium">
                  {syncStatus.lastSync 
                    ? syncStatus.lastSync.toLocaleString()
                    : 'Nunca'
                  }
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Leads Importados</p>
                <p className="text-2xl font-semibold text-orange-600">
                  {syncStatus.imported}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">Reglas de Automatización</TabsTrigger>
          <TabsTrigger value="capital-market">Capital Market</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reglas de Automatización</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium">{rule.name}</h3>
                        <Badge variant={rule.enabled ? "default" : "secondary"}>
                          {rule.enabled ? "Activa" : "Inactiva"}
                        </Badge>
                        <Badge variant="outline">
                          Prioridad: {rule.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{rule.description}</p>
                      
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="text-xs text-gray-400">
                          Trigger: <span className="font-mono">{rule.trigger_type}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-400">Acciones:</span>
                          {rule.actions.map((action: any, idx: number) => (
                            <div key={idx} className="flex items-center space-x-1">
                              {getActionIcon(action.type)}
                              <span className="text-xs">{action.type.replace('_', ' ')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={(enabled) => toggleRule({ id: rule.id, enabled })}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRule(rule.id)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteRule(rule.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))}
                
                {rules.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No hay reglas de automatización configuradas
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capital-market" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integración Capital Market</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <h3 className="font-medium">Estado de Conexión</h3>
                  <p className="text-sm text-gray-600">
                    Última sincronización: {syncStatus.lastSync?.toLocaleString() || 'Nunca'}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => testConnection()}
                    disabled={isTesting}
                  >
                    {isTesting ? 'Probando...' : 'Probar Conexión'}
                  </Button>
                  <Button 
                    onClick={() => syncFromCapitalMarket()}
                    disabled={isSyncing}
                  >
                    {isSyncing ? 'Sincronizando...' : 'Sincronizar Ahora'}
                  </Button>
                </div>
              </div>

              {syncStatus.errors.length > 0 && (
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-medium text-red-800">Errores de Sincronización:</h4>
                  <ul className="text-sm text-red-600 mt-2 space-y-1">
                    {syncStatus.errors.map((error, idx) => (
                      <li key={idx}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium">Configuración API</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    URL Base: https://api.capitalmarket.com
                  </p>
                  <p className="text-sm text-gray-600">
                    Estado: Configurado
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium">Estadísticas de Importación</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Leads importados: {syncStatus.imported}
                  </p>
                  <p className="text-sm text-gray-600">
                    Última actualización: {syncStatus.lastSync?.toLocaleDateString() || 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Automatización</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium">Reglas más Ejecutadas</h4>
                  <div className="space-y-2 mt-2">
                    {rules.slice(0, 3).map((rule) => (
                      <div key={rule.id} className="flex justify-between text-sm">
                        <span>{rule.name}</span>
                        <span className="text-gray-500">12 ejecuciones</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium">Eficiencia de Automatización</h4>
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between text-sm">
                      <span>Emails enviados</span>
                      <span className="text-green-600">45</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tareas creadas</span>
                      <span className="text-blue-600">23</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Leads cualificados</span>
                      <span className="text-purple-600">8</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutomationDashboard;
